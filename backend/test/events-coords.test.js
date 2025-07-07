const request = require("supertest");
const server = require("../server");
const { PrismaClient } = require("../generated/prisma");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        event: {
            findMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient(); // Use the mocked PrismaClient

describe("GET /events/within-bounds", () => {
    let agent;
    beforeEach(() => {
        agent = request.agent(server);
    });

    it("should return 400 if any bounding coordinate is not a number", async () => {
        const response = await agent.get("/events/within-bounds").query({
            swLng: "notANumber",
            swLat: 10,
            neLng: 20,
            neLat: 30,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "Bounding coordinates have to be numbers"
        );
    });

    it("should return 400 if any bounding coordinate is out of range", async () => {
        const response = await agent.get("/events/within-bounds").query({
            swLng: -200,
            swLat: 10,
            neLng: 20,
            neLat: 30,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "Bounding coordinates out of range"
        );
    });

    it("should return an empty array if no events are found", async () => {
        prisma.event.findMany.mockResolvedValueOnce([]);
        const response = await agent.get("/events/within-bounds").query({
            swLng: -10,
            swLat: -10,
            neLng: 10,
            neLat: 10,
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("should return events within the specified bounds", async () => {
        const mockEvents = [
            {
                id: 1,
                name: "Event 1",
                longitude: 0,
                latitude: 0,
                end_time: (new Date(Date.now() + 10000)).toISOString(),
            },
            {
                id: 2,
                name: "Event 2",
                longitude: 5,
                latitude: 5,
                end_time: (new Date(Date.now() + 10000)).toISOString(),
            },
        ];
        prisma.event.findMany.mockResolvedValueOnce(mockEvents);
        const response = await agent.get("/events/within-bounds").query({
            swLng: -10,
            swLat: -10,
            neLng: 10,
            neLat: 10,
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEvents);
    });
});