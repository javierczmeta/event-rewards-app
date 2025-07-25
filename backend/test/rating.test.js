const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        review: {
            upsert: jest.fn(),
            findMany: jest.fn(),
        },
        rSVP: {
            count: jest.fn(),
        },
        event: {
            findUnique: jest.fn()
        }
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

describe("POST /events/:eventId/reviews", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
        jest.resetAllMocks();
        prisma.event.findUnique.mockResolvedValue({ id: 1 });

    });

    it("should return 400 if review validation fails", async () => {
        const response = await agent.post("/events/1/reviews").send({});
        expect(response.status).toBe(400);
    });

    it("should return 403 if user has not checked into the event", async () => {
        prisma.rSVP.count.mockResolvedValue(0);
        const response = await agent.post("/events/1/reviews").send({
            rating: 5,
            review: "Great event!",
        });
        expect(response.status).toBe(403);
    });

    it("should create or update a review if user has checked into the event", async () => {
        prisma.rSVP.count.mockResolvedValue(1);
        prisma.review.upsert.mockResolvedValue({
            id: 1,
            rating: 5,
            review: "Great event!",
            eventId: 1,
            authorId: 1,
        });

        const response = await agent.post("/events/1/reviews").send({
            rating: 5,
            review: "Great event!",
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 1,
            rating: 5,
            review: "Great event!",
            eventId: 1,
            authorId: 1,
        });
    });
});

describe("GET /events/:eventId/reviews", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        jest.resetAllMocks();
        prisma.event.findUnique.mockResolvedValue({ id: 1 });
    });

    it("should fetch reviews for a given event", async () => {
        prisma.review.findMany.mockResolvedValue([
            {
                id: 1,
                rating: 5,
                review: "Great event!",
                eventId: 1,
                author: {
                    profile: {
                        name: "John Doe",
                    },
                },
            },
        ]);

        const response = await agent.get("/events/1/reviews");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                id: 1,
                rating: 5,
                review: "Great event!",
                eventId: 1,
                author: {
                    profile: {
                        name: "John Doe",
                    },
                },
            },
        ]);
    });
});