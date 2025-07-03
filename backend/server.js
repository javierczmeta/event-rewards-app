const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");

const { hashPassword, verifyPassword, calculateRewards } = require("./utils");

const { PrismaClient } = require("./generated/prisma");
const {
    newUserSchema,
    loginSchema,
    isAuthenticated,
    newEventSchema,
    rsvpValidation,
} = require("./validation");
const prisma = new PrismaClient();

let sessionConfig = {
    name: "sessionId",
    secret: "keep it secret, keep it safe",
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.RENDER ? true : false,
        httpOnly: false,
    },
    resave: false,
    saveUninitialized: false,
};

const server = express();
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
        res.clearCookie("sessionId", (err) => {
            console.log(err);
        }); // Clear session cookie
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
        },
        include: { organizer: { include: { profile: true } } },
    });

    switch (requestQueries.sort) {
        case "name":
            fetchedEvents.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            break;
        case "start":
            fetchedEvents.sort((a, b) => {
                return new Date(b.start_time) - new Date(a.start_time);
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

/* [GET] /events/id
    Returns speific event
*/
server.get("/events/:id", async (req, res, next) => {
    let id = req.params.id;

    // make sure id is Integer
    if (!Number.isInteger(Number(id))) {
        next({ message: "ID of the event has to be an integer", status: 400 });
        return;
    }

    let fetchedEvent = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: { organizer: { include: { profile: true } } },
    });

    if (!fetchedEvent) {
        return next({
            message: "The event with the specified ID does not exist",
            status: 404,
        });
    } else {
        res.json(fetchedEvent);
    }
});

/* [GET] /users/id/events
    Returns events organized by the userID
*/
server.get("/users/:id/events", async (req, res, next) => {
    let userId = req.params.id;

    // make sure id is Integer
    if (!Number.isInteger(Number(userId))) {
        next({ message: "ID of the user has to be an integer", status: 400 });
        return;
    }

    let fetchedEvents = await prisma.event.findMany({
        where: { organizer_id: parseInt(userId) },
    });

    res.json(fetchedEvents);
});

/* [DELETE] /events/id
    Deletes an event if the request is coming from the user who organized the event
*/
server.delete("/events/:id", isAuthenticated, async (req, res, next) => {
    let eventId = req.params.id;
    const sessionID = req.session.userId;

    // make sure id is Integer
    if (!Number.isInteger(Number(eventId))) {
        next({ message: "ID of the event has to be an integer", status: 400 });
        return;
    }

    try {
        let deletedEvent = await prisma.event.delete({
            where: { id: parseInt(eventId), organizer_id: sessionID },
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
            next({ status: 500, message: "Internal server error" });
        }
        return;
    }
});

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
        organizer_id: req.session.userId,
    };

    event = { ...event, rewards: await calculateRewards(0, event) };

    const added = await prisma.event.create({
        data: event,
    });

    res.json(added);
});

/* [POST] events/id/rsvp
    creates a new rsvp
    */
server.post("/events/:id/rsvp", isAuthenticated, async (req, res, next) => {
    const eventId = req.params.id;
    const sessionID = req.session.userId;

    // Validate with joi
    const { error } = rsvpValidation.validate(req.body);
    if (error) {
        return next({ status: 400, message: error.details[0].message });
    }

    // make sure id is Integer
    if (!Number.isInteger(Number(eventId))) {
        next({ message: "ID of the event has to be an integer", status: 400 });
        return;
    }

    // avoid duplicates
    let fetchedRSVP = await prisma.rSVP.findMany({
        where: { event_id: parseInt(eventId), user_id: sessionID },
    });
    if (fetchedRSVP) {
        return next({
            message: "RSVP data for this user and event already exixts",
            status: 409,
        });
    }

    // confirm event exists
    let fetchedEvent = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
    });
    if (!fetchedEvent) {
        return next({
            message: "The event with the specified ID does not exist",
            status: 404,
        });
    }

    let { status } = req.body;

    let newRsvp = {
        user_id: sessionID,
        event_id: parseInt(eventId),
        status,
    };

    const added = await prisma.rSVP.create({
        data: newRsvp
    });

    res.json(added);
});

// Error handling middleware
server.use((err, req, res, next) => {
    const { message, status = 500 } = err;
    res.status(status).json({ message: "ERROR 💀 " + message });
});

module.exports = server;
