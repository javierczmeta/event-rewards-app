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
 *  Utilizes a logarithmic function for rsvps and a linear factor depending on event duration
 */
async function calculateRewards(rsvpCount, event) {
    const rsvpReward = 2500 * Math.log10(rsvpCount + 1) + 1000 
    const timeFactor = 1/2 * 1/3600 * ((new Date(event.end_time)).getTime() - (new Date(event.start_time)).getTime()) * 1/1000
    return Math.round(rsvpReward * timeFactor)
}

module.exports = { hashPassword, verifyPassword, calculateRewards };
