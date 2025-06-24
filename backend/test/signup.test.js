const request = require("supertest");
const express = require("express");
const server = express();
const bodyParser = require("body-parser");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        profile: {
            create: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient(); // Use the mocked PrismaClient

// Mock other dependencies
jest.mock("../utils", () => ({
    hashPassword: jest.fn(),
}));

const hashPassword = require("../utils").hashPassword;

// Use bodyParser middleware to parse JSON
server.use(bodyParser.json());

// Import your route
server.post("/signup", require("../server"));

// Error handling middleware
server.use((err, req, res, next) => {
    const { message, status = 500 } = err;
    res.status(status).json({ message: "ERROR 💀 " + message });
});

describe("POST /signup", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if validation fails", async () => {
        const response = await request(server)
            .post("/signup")
            .send({ username: "" }); // Invalid data

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("ERROR 💀");
    });

    it("should return 400 if username already exists", async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 1,
            username: "existingUser",
        });

        const response = await request(server)
            .post("/signup")
            .send({ username: "existingUser", password: "password123" , display_name: "Example", dob: "11-11-2000"});

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Username already exists.");
    });

    it("should return 201 if user is created successfully", async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        hashPassword.mockResolvedValue("hashedPassword");
        prisma.user.create.mockResolvedValue({ id: 1 });
        prisma.profile.create.mockResolvedValue({ id: 1 });

        const response = await request(server).post("/signup").send({
            username: "newUser",
            password: "password123",
            display_name: "New User",
            img_url: "http://example.com/image.png",
            dob: "2000-01-01",
        });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("User created successfully!");
    });

    // Add more test cases as needed
});
