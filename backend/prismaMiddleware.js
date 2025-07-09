const { calculateRewards } = require("./utils");
const {prisma} = require("./prismaClient")

/**
 * Updates an event's point reward.
 * @param prisma prisma object
 * @param {number} eventID event id
 * @returns updated event
 */
async function updatePoints(prisma, eventID) {
    const goingCount = await prisma.rSVP.count({
        where: { event_id: eventID, status: "Going" },
    });

    const fetchedEvent = await prisma.event.findUnique({
        where: { id: eventID },
        include: { organizer: { include: { profile: true } } },
    });

    const rewards = calculateRewards(goingCount, fetchedEvent);

    const updated = await prisma.event.update({
        where: { id: eventID },
        data: { rewards: rewards },
    });

    return updated;
}

async function verifyEventExistance(req, res, next) {
    const eventId = req.params.eventId;

    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { organizer: { include: { profile: true } } },
        });

        if (!event) {
            return res.status(404).send({ message: "The event with the specified ID does not exist" });
        }

        req.event = event;
        next();
    } catch (error) {
        next(error);
    }
}

async function verifyRsvpExistance(req, res, next) {
    let userId;
    if (!req.params.userId) {
        userId = req.session.userId
    }else {
        userId = req.params.userId
    }

    let fetchedRSVP = await prisma.rSVP.findMany({
        where: { event_id: req.params.eventId, user_id: userId },
    });
    if (fetchedRSVP.length === 0) {
        return res.status(404).json({message: "RSVP data for this user and event does not exist"})
    }

    req.rsvp = fetchedRSVP[0];
    next();
}

module.exports = { updatePoints, verifyEventExistance, verifyRsvpExistance };
