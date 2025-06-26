const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient(); // Use the mocked PrismaClient

// Mock other dependencies
jest.mock("../utils", () => ({
    verifyPassword: jest.fn(),
}));

const verifyPassword = require("../utils").verifyPassword;

describe("POST /login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if validation fails", async () => {
        const response = await request(server)
            .post("/login")
            .send({ username: "" }); // Missing password

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("is not allowed to be empty");
    });

    it("should return 400 if user does not exist", async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const response = await request(server)
            .post("/login")
            .send({ username: "nonexistent", password: "password" });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "Invalid username or password."
        );
    });

    it("should return 400 if password is incorrect", async () => {
        prisma.user.findUnique.mockResolvedValue({
            username: "user",
            password_hash: "hashedpassword",
        });
        verifyPassword.mockResolvedValue(false);

        const response = await request(server)
            .post("/login")
            .send({ username: "user", password: "wrongpassword" });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "Invalid username or password."
        );
    });

    it("should return 200 if login is successful", async () => {
        prisma.user.findUnique.mockResolvedValue({
            username: "user",
            password_hash: "hashedpassword",
        });
        verifyPassword.mockResolvedValue(true);

        const response = await request(server)
            .post("/login")
            .send({ username: "user", password: "correctpassword" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful!");
    });
});
