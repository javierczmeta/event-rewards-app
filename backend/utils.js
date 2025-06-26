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

module.exports = { hashPassword, verifyPassword };
