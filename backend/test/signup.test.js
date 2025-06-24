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

    describe("Signup Validation Tests", () => {
        it("should return 400 if validation fails, username", async () => {
            const response = await request(server)
                .post("/signup")
                .send({ username: "", display_name: "Test", password: "password123", repeat_password: "password123", dob: "2000-01-01", img_url: "http://example.com/image.png" });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain(
                '"username" is not allowed to be empty'
            );
        });

        it("should return 400 if validation fails, display_name", async () => {
            const response = await request(server)
                .post("/signup")
                .send({ username: "abcd", display_name: "", password: "password123", repeat_password: "password123", dob: "2000-01-01", img_url: "http://example.com/image.png" });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain(
                '"display_name" is not allowed to be empty'
            );
        });
        it("should return 400 if validation fails, password", async () => {
            const response = await request(server)
                .post("/signup")
                .send({ username: "abcd", display_name: "Test", password: "short", repeat_password: "password123", dob: "2000-01-01", img_url: "http://example.com/image.png" }); // Invalid data
            expect(response.status).toBe(400);
            expect(response.body.message).toContain(
                '"password" length must be at least 8 characters long'
            );
        });
        
        it("should return 400 if validation fails, img_url", async () => {
            const response = await request(server)
                .post("/signup")
                .send({ username: "abcd", display_name: "Test", password: "password123", repeat_password: "password123", dob: "2000-01-01", img_url: "invalid-url" }); // Invalid data
            expect(response.status).toBe(400);
            expect(response.body.message).toContain(
                '"img_url" must be a valid uri'
            );
        });
        it("should return 400 if validation fails, img_url file type", async () => {
            const response = await request(server)
                .post("/signup")
                .send({ username: "abcd", display_name: "Test", password: "password123", repeat_password: "password123", dob: "2000-01-01", img_url: "http://example.com/image.txt" })
            expect(response.status).toBe(400);
            expect(response.body.message).toContain(
                '"img_url" with value "http://example.com/image.txt" fails to match the required pattern'
            );
        });
        it("should return 400 if validation fails, dob", async () => {
            const response = await request(server)
                .post("/signup")
                .send({ username: "abcd", display_name: "Test", password: "password123", repeat_password: "password123", dob: "2026-01-01", img_url: "http://example.com/image.png" }); // Invalid data
            expect(response.status).toBe(400);
            expect(response.body.message).toContain(
                '"dob" must be less than "now"'
            );
        });
    });

    it("should return 400 if username already exists", async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 1,
            username: "existingUser",
        });

        const response = await request(server).post("/signup").send({
            username: "existingUser",
            password: "password123",
            display_name: "Example",
            dob: "11-11-2000",
        });

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
