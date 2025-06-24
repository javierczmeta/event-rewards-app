const bcrypt = require("bcryptjs");

const hashPassword = async (plaintextPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(plaintextPassword, 12);
        return hashedPassword;
    } catch (err) {
        console.error("Hashing failed (bcryptjs):", err);
        throw err;
    }
};

module.exports = { hashPassword };
