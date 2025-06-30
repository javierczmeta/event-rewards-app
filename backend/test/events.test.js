const request = require("supertest");
const server = require("../server");


// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        event: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient(); // Use the mocked PrismaClient


describe("GET /events", () => {
    it("should return a list of events", async () => {
        const mockEvents = [
            { id: 1, name: "Event 1" },
            { id: 2, name: "Event 2" },
        ];
        prisma.event.findMany.mockResolvedValue(mockEvents);

        const response = await request(server).get("/events");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEvents);
    });

    it("should return filtered events based on search query", async () => {
        const mockEvents = [{ id: 1, name: "Event 1" }];
        prisma.event.findMany.mockResolvedValue(mockEvents);

        const response = await request(server)
            .get("/events")
            .query({ search: "Event 1" });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEvents);
    });
});

describe("GET /events/:id", () => {
    it("should return a specific event by ID", async () => {
        const mockEvent = { id: 1, name: "Event 1" };
        prisma.event.findUnique.mockResolvedValue(mockEvent);

        const response = await request(server).get("/events/1");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEvent);
    });

    it("should return 400 if ID is not an integer", async () => {
        const response = await request(server).get("/events/abc");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "ID of the event has to be an integer"
        );
    });

    it("should return 404 if event does not exist", async () => {
        prisma.event.findUnique.mockResolvedValue(null);

        const response = await request(server).get("/events/999");
        expect(response.status).toBe(404);
        expect(response.body.message).toContain(
            "The event with the specified ID does not exist"
        );
    });
});
