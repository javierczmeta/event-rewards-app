const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn(),
        },
        badge: {
            findFirst: jest.fn()
        }
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});


const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient(); // Use the mocked PrismaClient

describe("GET /users/:id", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        jest.resetAllMocks();
    });

    it("should return 400 if user ID is not an integer", async () => {
        const response = await agent.get("/users/notAnInteger");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("has to be an integer");
    });

    it("should return 404 if the user does not exist", async () => {
        prisma.user.findUnique.mockResolvedValueOnce(null);
        const response = await agent.get("/users/999");
        expect(response.status).toBe(404);
        expect(response.body.message).toContain("User not found");
    });

    it("should return user profile information for a valid user ID", async () => {
        const mockUser = {
            id: 1,
            username: "testuser",
            rsvps: [],
            profile: {
                display_name: "Test User",
                display_badges: ["badge1", "badge2"],
                image: "http://example.com/image.png",
                points: 100,
            },
        };

        prisma.user.findUnique.mockResolvedValueOnce(mockUser);
        prisma.badge.findFirst.mockResolvedValueOnce({id:1})

        const response = await agent.get("/users/1");


        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: 1,
                username: "testuser",
                rsvps: expect.any(Array),
                profile: expect.objectContaining({
                    display_name: "Test User",
                    display_badges: expect.any(Array),
                    image: "http://example.com/image.png",
                    points: 100,
                }),
            })
        );
    });
});