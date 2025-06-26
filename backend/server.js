const express = require("express");
const cors = require("cors");

const { hashPassword } = require("./utils");

const { PrismaClient } = require("./generated/prisma");
const { newUserSchema } = require("./validation");
const prisma = new PrismaClient();

const server = express();
server.use(cors());
server.use(express.json());

/* [POST] Creates a new user.
    username has to be unique.
    password has to be at least 8 characters long
*/
server.post("/signup", async (req, res, next) => {


    // Validate with joi
    const {error} = newUserSchema.validate(req.body);

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

    //
    let hashed = "";
    try{
        hashed = await hashPassword(password)
    } catch (e) {
        return next({status: 400, message: e.message})
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

// Error handling middleware
server.use((err, req, res, next) => {
    const { message, status = 500 } = err;
    console.log(message);
    res.status(status).json({ message: "ERROR 💀 " + message });
});

module.exports = server;
