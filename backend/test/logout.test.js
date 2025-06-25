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

// Mock setting userID
server.get("/set", (req, res, next) => {
    req.session.userId = 1;
    res.status(200).send("done");
});

describe("POST /logout", () => {
    it("should log out successfully and clear the session", async () => {
        // Simulate setting session
        const agent = request.agent(server);
        await agent.get("/set")

        // Perform logout
        const response = await agent.post("/logout");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Logged out successfully" });
        // Verify session is destroyed
        await agent.get("/me").expect(401);
    });
});
