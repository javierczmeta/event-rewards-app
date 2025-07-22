const { haversine } = require("./haversine");
const {prisma} = require("./prismaClient")

/**
 * Calculates the relative weight each category has for the user
 * @param {number} userId 
 * @returns {object} Weight object with categorues and their relative weights
 */
async function calculateCategoryWeights(userId) {

    const {fetchedEventsG, fetchedEventsN} = await getSetsForUserID(userId)

    const countsByCategoryTotal = countEvents(fetchedEventsG, fetchedEventsN)

    const keys = Object.keys(countsByCategoryTotal)
    const numCategories = keys.length
    const logged = []
    let sum = 0

    for (let i = 0; i < numCategories; i++) {
        log = Math.log10(countsByCategoryTotal[keys[i]] + 2);
        sum += log
        logged.push(log)
    }

    const weights = {}
    for (let i = 0; i < numCategories; i++) {
        weights[keys[i]] = logged[i] / sum
    }

    return weights
}

/**
 * Returns two lists of events the user is going to and events the user is not going to
 * @param {number} userId user identifier
 * @returns an object {fetchedEventsG, fetchedEventsN}
 */
async function getSetsForUserID(userId) {
    const fetchedEventsG = await prisma.rSVP.findMany({
        where: { user_id: userId, status: "Going" },
        include: { event: true },
    });

    const fetchedEventsN = await prisma.rSVP.findMany({
        where: { user_id: userId, status: "Not Going" },
        include: { event: true },
    });

    return {fetchedEventsG, fetchedEventsN}
}

/**
 * Counts the number of events in each category
 * @param {Array} fetchedEventsG Events user is going to
 * @param {Array} fetchedEventsN Events user is not going to
 * @returns An object of categories with their respective count
 */
function countEvents(fetchedEventsG, fetchedEventsN) {
        let initialCounts = {
        Miscellaneous: 0,
        "Music and Arts": 0,
        "Sports and Fitness": 0,
        "Food and Drink": 0,
        "Networking and Conferences": 0,
        "Travel and Adventure": 0,
        "Family and Kids": 0,
        "Charity and Fundraising": 0,
    };

    // Add 1 for each "Going" RSVP
    const countsByCategoryG = fetchedEventsG.reduce((acc, event) => {
        const category = event.event.category;
        acc[category]++;
        return acc;
    }, initialCounts);

    // Remove 1 for each "Not Going" RSVP. Cap at 0
    const countsByCategoryTotal = fetchedEventsN.reduce((acc, event) => {
        const category = event.event.category;
        acc[category] = Math.max(0, acc[category] - 1);
        return acc;
    }, countsByCategoryG);

    return countsByCategoryTotal
}

/**
 * Calculates the similarity between user1 and user2
 * @param {number} user1_id 
 * @param {number} user2_id 
 * @returns float between -1 and 1
 */
async function similarity(user1_id, user2_id) {
    // Get Sets
    let G1 = await prisma.rSVP.findMany({where: {user_id: user1_id, status: "Going"}, select: {event_id: true}})
    let G2 = await prisma.rSVP.findMany({where: {user_id: user2_id, status: "Going"}, select: {event_id: true}})
    let N1 = await prisma.rSVP.findMany({where: {user_id: user1_id, status: "Not Going"}, select: {event_id: true}})
    let N2 = await prisma.rSVP.findMany({where: {user_id: user2_id, status: "Not Going"}, select: {event_id: true}})

    // Only care about event ids
    G1 = G1.map(x => x.event_id)
    G2 = G2.map(x => x.event_id)
    N1 = N1.map(x => x.event_id)
    N2 = N2.map(x => x.event_id)

    // Convert to set
    G1 = new Set(G1)
    G2 = new Set(G2)
    N1 = new Set(N1)
    N2 = new Set(N2)

    // Jacard Index
    const numerator = G1.intersection(G2).size + N1.intersection(N2).size - N1.intersection(G2).size - G1.intersection(N2).size
    const denominator = G1.union(G2).union(N1).union(N2).size

    if (denominator === 0) {return 0}
    return numerator / denominator
}

/**
 * Calculates probability user is going to a certain event by calculating similarity with attendees
 * @param {number} userId 
 * @param {number} eventId 
 * @returns float -1 to 1
 */
async function probabilityGoing(userId, eventId) {
    let E_G = await prisma.rSVP.findMany({where: {event_id: eventId, status: "Going"}, select: {user_id: true}})
    let E_N = await prisma.rSVP.findMany({where: {event_id: eventId, status: "Not Going"}, select: {user_id: true}})

    let Z_G = 0
    for (const user of E_G) {
        const otherId = user.user_id
        Z_G += await similarity(userId, otherId)
    }

    let Z_N = 0
    for (const user of E_N) {
        const otherId = user.user_id
        Z_N += await similarity(userId, otherId)
    }

    const numerator = Z_G - Z_N
    const denominator = E_G.length + E_N.length

    if (denominator === 0) {return 0}

    return numerator / denominator
}

function distancePenalty(userCoords, eventCoords) {
    const {km} = haversine(userCoords, eventCoords)

    return Math.min(1, 50/km)
} 

module.exports = { calculateCategoryWeights, probabilityGoing, distancePenalty }