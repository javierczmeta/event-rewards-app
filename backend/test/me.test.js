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
    return
});

describe("GET /me", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 401 if user is not logged in", async () => {
        const response = await request(server).get("/me");

        expect(response.status).toBe(401);
        expect(response.body.message).toContain("Not logged in");
    });

    it("should return user data if user is logged in", async () => {
        prisma.user.findUnique.mockResolvedValue({ username: "testuser" });

        const agent = request.agent(server);
        await agent.get("/set");
        const response = await agent.get("/me");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: 1, username: "testuser" });
    });
});
