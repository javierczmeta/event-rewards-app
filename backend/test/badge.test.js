const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        profile: {
            findUnique: jest.fn(),
            update: jest.fn(),
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
    next();
});

describe("PATCH /badges/", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
        jest.resetAllMocks()
    });

    it("should return 400 if validation fails", async () => {
        const response = await agent
            .patch("/badges")
            .send({ badges: ['invalid'] })
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("must be a number");
    });
    it("should return 403 if user does not possess a badge", async () => {
        prisma.profile.findUnique.mockResolvedValue({
            badges: [{ id: 1 }],
        });
        const response = await agent
            .patch("/badges")
            .send({ badges: [2] });
        expect(response.status).toBe(403);
        expect(response.body.message).toContain(
            "Cannot display badge 2 because user does not possess it"
        );
    });
    it("should update display badges if valid", async () => {
        prisma.profile.findUnique.mockResolvedValue({
            id: "user1",
            badges: [{ id: 1 }, { id: 2 }],
        });
        prisma.profile.update.mockResolvedValue({
            id: "user1",
            display_badges: [{ id: 1 }, { id: 2 }],
        });
        const response = await agent
            .patch("/badges")
            .send({ badges: [1, 2] });
        expect(response.status).toBe(200);
        expect(response.body.display_badges).toEqual([
            { id: 1 },
            { id: 2 },
        ]);
    });
});
