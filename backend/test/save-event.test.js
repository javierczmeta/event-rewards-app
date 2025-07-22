const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        profile: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        event: {
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
    next();
});

describe("PATCH /events/saved/:eventId", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
        jest.resetAllMocks();
        prisma.event.findUnique.mockResolvedValue({ id: 1 });
    });
    it("should remove the event if it is already saved", async () => {
        // Mock database responses
        prisma.profile.findUnique.mockResolvedValue({
            id: 1,
            saved_events: [{ id: 1 }],
        });
        prisma.profile.update.mockResolvedValue({
            id: 1,
            saved_events: [],
        });
        const response = await agent.patch(`/events/saved/1`);
        expect(response.status).toBe(200);
        expect(response.body.saved_events).toEqual([]);
    });
    it("should add the event if it is not already saved", async () => {
        // Mock database responses
        prisma.profile.findUnique.mockResolvedValue({
            id: 1,
            saved_events: [{ id: 2 }],
        });
        prisma.profile.update.mockResolvedValue({
            id: 1,
            saved_events: [{ id: 2 }, { id: 1 }],
        });
        const response = await agent.patch(`/events/saved/1`);
        expect(response.status).toBe(200);
        expect(response.body.saved_events).toEqual([
            { id: 2 },
            { id: 1 },
        ]);
    });
});
