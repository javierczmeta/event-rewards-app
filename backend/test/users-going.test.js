const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        rSVP: {
            findMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient(); // Use the mocked PrismaClient

describe("GET /users/:userId/going", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("returns going events for the user", async () => {
        const mockEvents = [{ event: { id: 1, name: "Test Event" } }];
        prisma.rSVP.findMany.mockResolvedValue(mockEvents);
        const res = await request(server).get("/users/42/going");
        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockEvents);
        expect(prisma.rSVP.findMany).toHaveBeenCalledWith({
            where: { user_id: 42, status: "Going" },
            select: { event: true },
        });
    });
    it("returns empty array if no events", async () => {
        prisma.rSVP.findMany.mockResolvedValue([]);
        const res = await request(server).get("/users/99/going");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
    it("handles errors from prisma", async () => {
        prisma.rSVP.findMany.mockRejectedValue(new Error("DB error"));
        const res = await request(server).get("/users/42/going");
        expect(res.status).toBe(500);
    });
});
