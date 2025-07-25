const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");

const { hashPassword, verifyPassword, calculateRewards } = require("./utils");

const {
    updatePoints,
    verifyEventExistance,
    verifyRsvpExistance,
} = require("./prismaMiddleware");

const {
    newUserSchema,
    loginSchema,
    isAuthenticated,
    newEventSchema,
    rsvpValidation,
    verifyParamstoInt,
    displayBadgeSchema,
    schedulerValidation,
    reviewValidation
} = require("./validation");

const { calculateCategoryWeights, probabilityGoing, distancePenalty } = require("./recommendation");
const { prisma } = require("./prismaClient");
const { getProfitByPoints, getProfitByDistance, schedule, scheduleWithCommutes, getProfitByPrice } = require("./scheduler");

let sessionConfig = {
    name: "sessionId",
    secret: "keep it secret, keep it safe",
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.RENDER ? true : false,
        httpOnly: false,
        sameSite: process.env.RENDER ? 'None' : 'Lax'
    },
    resave: false,
    saveUninitialized: false,
};

const server = express();

if (process.env.RENDER) {
    server.set('trust proxy', true)
} 

server.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true, // Allows sending credentials
    })
);
server.use(express.json());
server.use(session(sessionConfig));

/* [POST] Creates a new user.
    username has to be unique.
    password has to be at least 8 characters long
*/
server.post("/signup", async (req, res, next) => {
    // Validate with joi
    const { error } = newUserSchema.validate(req.body);

    if (error) {
        return next({ status: 400, message: error.details[0].message });
    }

    const { username, display_name, password, img_url, dob } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        return next({ status: 400, message: "Username already exists." });
    }

    let hashed = "";
    try {
        hashed = await hashPassword(password);
    } catch (e) {
        return next({ status: 400, message: e.message });
    }

    const newUser = await prisma.user.create({
        data: {
            username,
            password_hash: hashed,
        },
    });

    // Also create new profile and link with user.
    const newProfile = await prisma.profile.create({
        data: {
            user_id: newUser.id,
            display_name,
            image: img_url,
            dob: new Date(dob),
        },
    });

    res.status(201).json({ message: "User created successfully!" });
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many failed login attempts. Try again later." },
});

/* [POST] Logs in a user.
    Checks against database
*/
server.post("/login", loginLimiter, async (req, res, next) => {
    const { error } = loginSchema.validate(req.body);

    if (error) {
        return next({ status: 400, message: error.details[0].message });
    }

    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return next({ status: 400, message: "Invalid username or password." });
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
        return next({ status: 400, message: "Invalid username or password." });
    }

    req.session.userId = user.id;
    res.json({ message: "Login successful!" });
});

/* [GET] Session data
    Return logged in user, if available
*/
server.get("/me", async (req, res, next) => {
    if (!req.session.userId) {
        return next({ status: 401, message: "Not logged in" });
    }

    const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: {
            username: true,
            id: true,
            profile: {
                select: {
                    display_name: true,
                    display_badges: true,
                    image: true,
                    points: true,
                    saved_events: true
                },
            },
        },
    });

    res.json(user);
});

/* [POST] Logs out the user */
server.post("/logout", async (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to log out" });
        }
        res.clearCookie("sessionId", {
            path: '/',
            httpOnly: false,
            secure: process.env.RENDER ? true : false,
            sameSite: process.env.RENDER ? 'None' : 'Lax'
        });
        res.json({ message: "Logged out successfully" });
    });
});

/* [GET] /events
    Returns a list of all events 
*/
server.get("/events", async (req, res, next) => {
    let requestQueries = req.query;
    let fetchedEvents = [];

    fetchedEvents = await prisma.event.findMany({
        where: {
            name: { contains: requestQueries.search, mode: "insensitive" },
            end_time: { gte: new Date((new Date(Date.now())).getTime() - ((new Date()).getTimezoneOffset() * 60 * 1000)) },
        },
        include: { organizer: { include: { profile: true } }, profiles_saved: true },
    });

    switch (requestQueries.sort) {
        case "name":
            fetchedEvents.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            break;
        case "start":
            fetchedEvents.sort((a, b) => {
                return new Date(a.start_time) - new Date(b.start_time);
            });
            break;
        case "posting":
            fetchedEvents.sort((a, b) => {
                return new Date(a.created_at) - new Date(b.created_at);
            });
            break;
        case "points":
            fetchedEvents.sort((a, b) => {
                return b.rewards - a.rewards;
            });
            break;
        default:
            break;
    }

    res.json(fetchedEvents);
});

/* [GET] recommended events
*/
server.get("/events/recommended", isAuthenticated, async (req, res, next) => {
    const sessionID = req.session.userId;
    let lng = req.query.lng;
    let lat = req.query.lat;
    const withDistance = lng !== undefined && lat !== undefined

    // make sure corners are numbers
    if (
        withDistance &&
        (!Number.isFinite(Number(lng)) ||
        !Number.isFinite(Number(lat)))
    ) {
        next({
            message: "Coordinates are not numbers",
            status: 400,
        });
        return;
    }

    lng = parseFloat(lng);
    lat = parseFloat(lat);

    // make sure corners are valid coordinates
    if (withDistance &&
        !(
            -180 <= lng &&
            lng <= 180 &&
            -90 <= lat &&
            lat <= 90 
        )
    ) {
        next({
            message: "Coordinates out of range",
            status: 400,
        });
        return;
    }

    // Get events that have not happened, user is not organizer, and user status is not "Going"
    const allEvents = await prisma.event.findMany({
        where: {organizer_id: {not: sessionID}, rsvps: {none: {user_id: sessionID, status: "Going"}}, start_time: {gte: new Date(Date.now())}}
    });

    const weights = await calculateCategoryWeights(sessionID)

    for (let i = 0; i < allEvents.length; i++) {
        const probabilityDueToSimilarity = await probabilityGoing(sessionID, allEvents[i].id)

        const multiplier = (weights[allEvents[i].category] + probabilityDueToSimilarity)

        const penalty = withDistance ? distancePenalty({lon: lng, lat},{lon: allEvents[i].longitude, lat: allEvents[i].latitude}) : 1

        allEvents[i].score = allEvents[i].rewards * multiplier * penalty
        allEvents[i].multiplier = multiplier * penalty
    }

    allEvents.sort((a, b) => {return b.score - a.score})

    res.json(allEvents);
});

/* [POST] events/schedule
    Finds the best schedule from a list of events
    Expects a list of events in the body
    Expects array of profit modes
 */
server.post('/events/schedule', async (req,res,next) => {
    const withCommute = req.query.commute === "true"

    // Validate body contains list if events and list of modes
    const { error } = schedulerValidation.validate(req.body)
    if (error) {
        return next({ status: 400, message: error.details[0].message });
    }

    let {events, userLocation, profitModes} = req.body


    if (profitModes.some(x => x.name === "points")) {
        const weight = profitModes.find(x => x.name === "points").weight
        events = getProfitByPoints(events, weight)
    }

    if (profitModes.some(x => x.name === "price")) {
        const weight = profitModes.find(x => x.name === "price").weight
        events = getProfitByPrice(events, weight)
    }

    if (profitModes.some(x => x.name === "distance")) {
        if (userLocation === undefined) {
            return next({status: 400, message: "Cannot get distance profit without user location"})
        }
        else {
            const weight = profitModes.find(x => x.name === "distance").weight
            events = getProfitByDistance(events, userLocation, weight)
        }
    }

    let result;
    if (withCommute) {
        result = await scheduleWithCommutes(events)
    } else {
        result = await schedule(events)
    }

    res.json(result)
})

/*  [GET] /users/:userId/going
    Reutrns the events a user is going to
*/
server.get("/users/:userId/going", verifyParamstoInt, async (req,res,next) => {
    const fetchedRSVPS = await prisma.rSVP.findMany({where: {user_id: req.params.userId, status: "Going"}, select: {event: true}})
    res.json(fetchedRSVPS)
})

/* [GET] /events/within-bounds
    Returns events inside the requested area
    Recieves 2 queries sw corned and ne corner
*/
server.get("/events/within-bounds", async (req, res, next) => {
    let swLng = req.query.swLng;
    let swLat = req.query.swLat;
    let neLng = req.query.neLng;
    let neLat = req.query.neLat;

    // make sure corners are numbers
    if (
        !Number.isFinite(Number(swLng)) ||
        !Number.isFinite(Number(swLat)) ||
        !Number.isFinite(Number(neLng)) ||
        !Number.isFinite(Number(neLat))
    ) {
        next({
            message: "Bounding coordinates have to be numbers",
            status: 400,
        });
        return;
    }

    swLng = parseFloat(swLng);
    swLat = parseFloat(swLat);
    neLng = parseFloat(neLng);
    neLat = parseFloat(neLat);

    // make sure corners are valid coordinates
    if (
        !(
            -180 <= swLng &&
            swLng <= 180 &&
            -180 <= neLng &&
            neLng <= 180 &&
            -90 <= swLat &&
            swLat <= 90 &&
            -90 <= neLat &&
            neLat <= 90
        )
    ) {
        next({
            message: "Bounding coordinates out of range",
            status: 400,
        });
        return;
    }

    let fetchedEvents = await prisma.event.findMany({
        where: {
            longitude: { gte: swLng, lte: neLng },
            latitude: { gte: swLat, lte: neLat },
            end_time: { gte: new Date(Date.now()) },
        },
    });

    res.json(fetchedEvents);
});

/* [GET] /events/id
    Returns speific event
*/
server.get(
    "/events/:eventId",
    verifyParamstoInt,
    verifyEventExistance,
    async (req, res, next) => {
        res.json(req.event);
    }
);

/* [GET] /users/id
    Returns profile info for the requested id
*/
server.get("/users/:id", verifyParamstoInt, async (req, res, next) => {
    let userId = req.params.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            username: true,
            id: true,
            rsvps: {include: {event: true}, orderBy: {updated_at: 'desc'}},
            profile: {
                select: {
                    display_name: true,
                    display_badges: true,
                    badges: true,
                    image: true,
                    points: true,
                    badge_order: true
                },
            },
        },
    });

    if (user === null) {
        return next({status: 404, message: "User not found"})
    }

    // Obtain next badge for milestone count
    const nextBadge = await prisma.badge.findFirst({where: {requirement: {gt: user.profile.points}}, orderBy: {requirement:'asc'}})

    res.json({...user, nextBadge});
});


/* [GET] /users/id/events
    Returns saved events and organized events by the userID
*/
server.get("/users/:id/events", verifyParamstoInt, async (req, res, next) => {
    let userId = req.params.id;

    let organizedEvents = await prisma.event.findMany({
        where: { organizer_id: userId },
        orderBy: {
            start_time: "asc",
        },
    });

    let savedEvents = await prisma.profile.findUnique({where: {user_id: userId}, select: {saved_events: true}})

    res.json({organized_events: organizedEvents, ...savedEvents});
});

/* [DELETE] /events/id
    Deletes an event if the request is coming from the user who organized the event
*/
server.delete(
    "/events/:id",
    isAuthenticated,
    verifyParamstoInt,
    async (req, res, next) => {
        let eventId = req.params.id;
        const sessionID = req.session.userId;

        try {
            let deletedEvent = await prisma.event.delete({
                where: { id: eventId, organizer_id: sessionID },
            });
            return res.json(deletedEvent);
        } catch (e) {
            if (e.meta) {
                // Means it was a prisma error (no record found)
                next({
                    status: 404,
                    message:
                        "No event with the specified ID was found for this user",
                });
            } else {
                next({ message: "Internal server error" });
            }
            return;
        }
    }
);

/* [POST] events
    creates a new event with the sent information
    */
server.post("/events", isAuthenticated, async (req, res, next) => {
    // Validate with joi
    const { error } = newEventSchema.validate(req.body);

    if (error) {
        return next({ status: 400, message: error.details[0].message });
    }

    let {
        name,
        latitude,
        longitude,
        image,
        start_time,
        end_time,
        price,
        description,
        category,
    } = req.body;

    let event = {
        name,
        latitude,
        longitude,
        image,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        price,
        description,
        category,
        code: Math.floor(100000 + Math.random() * 900000),
        organizer_id: req.session.userId,
    };

    event = { ...event, rewards: calculateRewards(0, event) };

    const added = await prisma.event.create({
        data: event,
    });

    res.json(added);
});

/* [POST] events/id/rsvp
    creates a new rsvp
    */
server.post(
    "/events/:eventId/rsvp",
    isAuthenticated,
    verifyParamstoInt,
    verifyEventExistance,
    async (req, res, next) => {
        const sessionID = req.session.userId;

        // Validate with joi
        const { error } = rsvpValidation.validate(req.body);
        if (error) {
            return next({ status: 400, message: error.details[0].message });
        }

    // avoid duplicates
    let fetchedRSVP = await prisma.rSVP.findFirst({
        where: { event_id: req.params.eventId, user_id: sessionID },
    });


    let { status } = req.body;

    let newRsvp = {
        user_id: sessionID,
        event_id: req.params.eventId,
        status,
        updated_at: new Date(Date.now()),
    };

    // Already one
    let update
    if (fetchedRSVP) {
        if (fetchedRSVP.check_in_time) {return next({status: 400, message: "You have already checked in to this event!"});}

        update = await prisma.rSVP.update({
            where: { id: fetchedRSVP.id },
            data: newRsvp,
        });
    } else {
        update = await prisma.rSVP.create({
            data: newRsvp,
        });
    }

    await updatePoints(prisma, req.params.eventId);
    res.json(update);
});

/* [GET] events/id/rsvp
    gets the rsvp status
    */
server.get(
    "/events/:eventId/rsvp",
    isAuthenticated,
    verifyParamstoInt,
    verifyEventExistance,
    async (req, res, next) => {
        
    let fetchedRSVP = await prisma.rSVP.findFirst({
            where: {
                event_id: req.params.eventId,
                user_id: req.session.userId,
            },
    });

    if (!fetchedRSVP) {
        return res.json([]);
    }

        res.json(fetchedRSVP);
    }
);

/* [PATCH] events/id/checkin/id
    Adds current time to rsvp
    */
server.patch(
    "/events/:eventId/checkin/:userId/:code",
    isAuthenticated,
    verifyParamstoInt,
    verifyEventExistance,
    verifyRsvpExistance,
    async (req, res, next) => {
        const sessionID = req.session.userId;

        if (req.rsvp.status === "Not Going") {
            return next({
                message: "User has to change status before checking in.",
                status: 400,
            });
        }

        if (req.rsvp.check_in_time) {
            return next({
                message: "User already checked in!",
                status: 409,
            });
        }

        if (req.params.code !== req.event.code) {
            return next({
                message: "The code is not correct",
                status: 401,
            });
        }

        // Update it
        const updateRSVP = await prisma.rSVP.update({
            where: {id: req.rsvp.id},
            data: {status: "Going", check_in_time: new Date(Date.now()), updated_at: new Date(Date.now()),}
        });

        const updatedEvent = await updatePoints(prisma, req.params.eventId); 

        // Reward points to user
        let profile = await prisma.profile.findUnique({where: {user_id: req.params.userId}})

        // Reward badge + points to user
        const allowedBadges = await prisma.badge.findMany({where: {requirement: {lte: profile.points + updatedEvent.rewards}}})
        const addBadges = await prisma.profile.update({where: {id: profile.id}, data: {points: profile.points + updatedEvent.rewards, badges: {connect: allowedBadges.map(badge => {return {id: badge.id}})}}})

        res.json(updateRSVP);
    }
);

/* [GET] events/id/attendees
    gets the user profiles of the pople who are "Going" to an event
    */
server.get(
    "/events/:eventId/attendees",
    verifyParamstoInt,
    verifyEventExistance,
    async (req, res, next) => {
        let eventId = req.params.eventId;

        let fetchedRSVP = await prisma.rSVP.findMany({
            where: { event_id: eventId, status: "Going" },
            include: { user: { select: { profile: {select: {
                user_id: true, 
                display_name: true, 
                display_badges: true, 
                badge_order: true,
                points: true, 
                image: true } 
            }}},
        }});

        res.json(fetchedRSVP);
    }
);

/** [PATCH] badges/users/id
 * Update badges user is displaying
 */
server.patch('/badges', isAuthenticated, async (req,res,next) => {
    const sessionId = req.session.userId;

    // Validate body contains 'badges' array with 3 max
    const { error } = displayBadgeSchema.validate(req.body)
    if (error) {
        return next({ status: 400, message: error.details[0].message });
    }

    const userProfile = await prisma.profile.findUnique({where: {user_id: sessionId}, include: {badges: true}})
    const badgeSet = new Set(userProfile.badges.map(badge => badge.id))

    const newDisplay = []
    const badgeOrder = []

    // Check each display badge and make sure user can display it
    for (let badgeID of req.body.badges) {
        if (!badgeSet.has(badgeID)) {
            return next({message: `Cannot display badge ${badgeID} because user does not possess it`, status: 403})
        }
        newDisplay.push({id: badgeID})
        badgeOrder.push(badgeID)
    }

    const updated = await prisma.profile.update({where: {id: userProfile.id}, data: {display_badges: {set: newDisplay}, badge_order: badgeOrder}})

    res.json(updated)
})


/** [PATCH] /events/saved/:eventId
 * Toggles if an event is saved or not
 */
server.patch('/events/saved/:eventId', isAuthenticated, verifyParamstoInt, verifyEventExistance, async (req,res,next) => {
    const sessionId = req.session.userId;

    const userProfile = await prisma.profile.findUnique({where: {user_id: sessionId}, include: {saved_events: true}})
    const eventSet = new Set(userProfile.saved_events.map(event => event.id))

    let newEvents = []

    // Toggle event is saved
    if (eventSet.has(req.params.eventId)) {
        newEvents = userProfile.saved_events.filter(event => event.id !== req.params.eventId).map(event => {return {id: event.id}})
    } else {
        newEvents = userProfile.saved_events.map(event => {return{id: event.id}}).concat({id: req.params.eventId})
    }

    const updated = await prisma.profile.update({where: {id: userProfile.id}, data: {saved_events: {set: newEvents}}})

    res.json(updated)
})

// [POST] a review
server.post('/events/:eventId/reviews', isAuthenticated, verifyParamstoInt, verifyEventExistance, async (req,res,next) => {
    const sessionId = req.session.userId;

    // Validate body contains a review
    const { error } = reviewValidation.validate(req.body)
    if (error) {
        return next({ status: 400, message: error.details[0].message });
    }

    const hasBeen = (await prisma.rSVP.count({where: {user_id: sessionId, event_id: req.params.eventId, check_in_time: {not: null}}})) != 0
    if (!hasBeen) {
        return next({status: 403, message: "Cannot post review because user has not checked to event"})
    }

    const createdReview = await prisma.review.upsert({
        where: {
            authorId_eventId: {
                authorId: sessionId,
                eventId: req.params.eventId,
                }
        },
        update: {
            rating: req.body.rating,
            review: req.body.review,
        },
        create: {
            rating: req.body.rating,
            review: req.body.review,
            eventId: req.params.eventId,
            authorId: sessionId,
        }
    })

    res.json(createdReview)
})

// [GET] reviews by eventID
server.get('/events/:eventId/reviews', verifyParamstoInt, verifyEventExistance, async (req,res,next) => {
    const fetchedReviews = await prisma.review.findMany({where: {eventId: req.params.eventId}, include: {author: {select: {profile: true}}}})
    res.json(fetchedReviews)
})



// Error handling middleware
server.use((err, req, res, next) => {
    const { message, status = 500 } = err;
    res.status(status).json({ message: "ERROR 💀 " + message });
});

module.exports = server;
