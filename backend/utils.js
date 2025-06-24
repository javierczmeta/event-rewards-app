const bcrypt = require("bcryptjs");

const hashPassword = async (plaintextPassword) => {
    const hashedPassword = await bcrypt.hash(plaintextPassword, 12);
    return hashedPassword;
};

module.exports = { hashPassword };
