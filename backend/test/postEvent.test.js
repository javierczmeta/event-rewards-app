const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        event: {
            create: jest.fn().mockResolvedValue({
                id: 1,
                organizer_id: 1,
                name: "Test Event",
                latitude: 45,
                longitude: 90,
                image: "test.jpg",
                start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                end_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
                price: "100",
                description: "Test Description",
                category: "test",
            }),
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

describe("POST /events", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
    });
    it("should create a new event and return it", async () => {
        const newEvent = {
            name: "Test Event",
            latitude: 45,
            longitude: 90,
            image: "test.jpg",
            start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            end_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
            price: "100",
            description: "Test Description",
            category: "test",
        };

        const response = await agent
            .post("/events")
            .send(newEvent)
            .expect("Content-Type", /json/)
            .expect(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe(newEvent.name);
        expect(response.body.latitude).toBe(newEvent.latitude);
        expect(response.body.longitude).toBe(newEvent.longitude);
        expect(response.body.image).toBe(newEvent.image);
        expect(response.body.price).toBe(newEvent.price);
        expect(response.body.description).toBe(newEvent.description);
        expect(response.body.category).toEqual(newEvent.category);
        expect(response.body.organizer_id).toBe(1);
    });

    it("should return 400 if validation fails (missing required fields)", async () => {
        const invalidEvent = {
            // Missing required fields like name, latitude, etc.
        };
        const response = await agent
            .post("/events")
            .send(invalidEvent)
            .expect(400);
        expect(response.body).toHaveProperty("message");
    });
    it("should return 400 if validation fails (invalid latitude)", async () => {
        const invalidEvent = {
            name: "Test Event",
            latitude: 100, // Invalid latitude
            longitude: 90,
            start_time: new Date(Date.now() + 3600000).toISOString(),
            end_time: new Date(Date.now() + 7200000).toISOString(),
            price: "100",
            description: "Test Description",
            category: "test",
        };
        const response = await agent
            .post("/events")
            .send(invalidEvent)
            .expect(400);
        expect(response.body).toHaveProperty("message");
    });
    it("should return 400 if validation fails (end_time before start_time)", async () => {
        const invalidEvent = {
            name: "Test Event",
            latitude: 45,
            longitude: 90,
            start_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
            end_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            price: "100",
            description: "Test Description",
            tags: ["test"],
        };
        const response = await agent
            .post("/events")
            .send(invalidEvent)
            .expect(400);
        expect(response.body).toHaveProperty("message");
    });
});
