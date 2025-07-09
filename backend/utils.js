const argon2 = require("argon2");

/**
 * Hashes a password using argon2.
 * @param {string} plaintextPassword Password string to hash
 * @returns {string} hashedPassword
 */
const hashPassword = async (plaintextPassword) => {
    try {
        const hashedPassword = await argon2.hash(plaintextPassword, 12);
        return hashedPassword;
    } catch (err) {
        console.error("Hashing failed (argon):", err);
        throw err;
    }
};

/**
 * Verifies a password against a hash.
 * @param {string} plainPassword Plain password to check.
 * @param {string} hash Hash to comparea gainst
 * @returns {boolean} Verification result
 */
async function verifyPassword(plainPassword, hash) {
    try {
        return await argon2.verify(hash, plainPassword);
    } catch (err) {
        console.error("Hashing failed (argon):", err);
        throw err;
    }
}

/**
 * Gives a point calue to an event
 * @param rsvpCount Integer number of current rsvps
 * @param event Object
 */
function calculateRewards(rsvpCount, event) {
    const rsvpReward = 1000 / (rsvpCount + 20) + 50;
    const miliseconds =
        new Date(event.end_time).getTime() -
        new Date(event.start_time).getTime();
    const timeFactor = (Math.log(((miliseconds)/1000 * 1/60))+1)/(Math.log(60)) // Log_60(minutes + 1)
    return Math.round(rsvpReward * timeFactor);
}

module.exports = {
    hashPassword,
    verifyPassword,
    calculateRewards,
};
