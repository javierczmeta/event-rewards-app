const request = require("supertest");
const server = require("../server");

jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        event: {
            findMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient(); // Use the mocked PrismaClient

const { calculateCategoryWeights, probabilityGoing } = require("../recommendation");

// Mock setting userID
server.get("/set", (req, res, next) => {
    req.session.userId = 1;
    res.status(200).send("done");
    next();
});

jest.mock("../recommendation", () => ({
    calculateCategoryWeights: jest.fn(),
    probabilityGoing: jest.fn(),
}));

describe("GET /events/recommended", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
    });

    it("should return an empty array if no events are available", async () => {
        prisma.event.findMany.mockResolvedValueOnce([]);
        calculateCategoryWeights.mockResolvedValueOnce({});
        probabilityGoing.mockResolvedValueOnce(0);

        const response = await agent.get("/events/recommended");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("should return events sorted by score", async () => {
        const mockEvents = [
            { id: 1, category: "Music and Arts", rewards: 10 },
            { id: 2, category: "Sports and Fitness", rewards: 20 },
            { id: 3, category: "Food and Drink", rewards: 15 },
        ];
        const mockWeights = {
            "Music and Arts": 0.5,
            "Sports and Fitness": 0.3,
            "Food and Drink": 0.2,
        };

        prisma.event.findMany.mockResolvedValueOnce(mockEvents);
        calculateCategoryWeights.mockResolvedValueOnce(mockWeights);
        probabilityGoing.mockImplementation((userId, eventId) => {
            if (eventId === 1) return 0.1;
            if (eventId === 2) return 0.2;
            if (eventId === 3) return 0.3;
            return 0;
        });

        const response = await agent.get("/events/recommended");
        expect(response.status).toBe(200);

        const expectedEvents = [
            { id: 2, category: "Sports and Fitness", rewards: 20, score: expect.any(Number), multiplier: expect.any(Number) },
            { id: 3, category: "Food and Drink", rewards: 15, score: expect.any(Number), multiplier: expect.any(Number) },
            { id: 1, category: "Music and Arts", rewards: 10, score: expect.any(Number), multiplier: expect.any(Number) },
            ,
        ];

        expect(response.body).toEqual(expectedEvents.slice(0, 5));
        expect(response.body[0].score).toBeGreaterThan(response.body[1].score);
        expect(response.body[1].score).toBeGreaterThan(response.body[2].score);
    });
});