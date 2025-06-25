const argon2 = require("argon2");

const hashPassword = async (plaintextPassword) => {
    try {
        const hashedPassword = await argon2.hash(plaintextPassword, 12);
        return hashedPassword;
    } catch (err) {
        console.error("Hashing failed (argon):", err);
        throw err;
    }
};

async function verifyPassword(plainPassword, hash) {
    try {
        return await argon2.verify(hash, plainPassword);
    } catch (err) {
        console.error("Hashing failed (argon):", err);
        throw err;
    }
}

module.exports = { hashPassword, verifyPassword };
