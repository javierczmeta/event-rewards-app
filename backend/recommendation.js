const {prisma} = require("./prismaClient")

/**
 * Calculates the relative weight each category has for the user
 * @param {number} userId 
 * @returns {object} Weight object with categorues and their relative weights
 */
async function calculateCategoryWeights(userId) {
    const fetchedEventsG = await prisma.rSVP.findMany({
        where: { user_id: userId, status: "Going" },
        include: { event: true },
    });

    const fetchedEventsN = await prisma.rSVP.findMany({
        where: { user_id: userId, status: "Not Going" },
        include: { event: true },
    });

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

    const countsByCategoryG = fetchedEventsG.reduce((acc, event) => {
        const category = event.event.category;
        acc[category]++;
        return acc;
    }, initialCounts);

    const countsByCategoryTotal = fetchedEventsN.reduce((acc, event) => {
        const category = event.event.category;
        acc[category]--;
        return acc;
    }, countsByCategoryG);

    keys = Object.keys(countsByCategoryTotal)
    n = keys.length
    logged = []
    sum = 0

    for (let i = 0; i < n; i++) {
        log = Math.log10(countsByCategoryTotal[keys[i]] + 2);
        sum += log
        logged.push(log)
    }

    weights = {}
    for (let i = 0; i < n; i++) {
        weights[keys[i]] = logged[i] / sum
    }

    return weights
}

module.exports = { calculateCategoryWeights }