const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        rSVP: {
            create: jest.fn(),
            findMany: jest.fn(),
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

describe("POST /events/:id/rsvp", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
        jest.resetAllMocks()
    });

    it("should return 400 if validation fails", async () => {
        const response = await agent
            .post("/events/1/rsvp")
            .send({ invalidField: "invalidValue" });
        expect(response.status).toBe(400);
        expect(response.body.message).toBeDefined();
    });
    it("should return 400 if event ID is not an integer", async () => {
        const response = await agent
            .post("/events/notAnInteger/rsvp")
            .send({ status: "Going" });
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "ID of the event has to be an integer"
        );
    });
    it("should return 404 if event does not exist", async () => {
        prisma.rSVP.findMany.mockResolvedValueOnce([]);
        prisma.event.findUnique.mockResolvedValueOnce(null);
        const response = await agent
            .post("/events/1/rsvp")
            .send({ status: "Going" });
        expect(response.status).toBe(404);
        expect(response.body.message).toContain(
            "The event with the specified ID does not exist"
        );
    });
    it("should update the RSVP and return it", async () => {
        prisma.rSVP.findMany.mockResolvedValueOnce([{ id: 1 }]);
        prisma.event.findUnique.mockResolvedValueOnce({ id: 1 });
        prisma.rSVP.update.mockResolvedValueOnce({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "going",
        });
        const response = await agent
            .post("/events/1/rsvp")
            .send({ status: "Going" });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "going",
        });
    });
    it("should create a new RSVP and return it", async () => {
        prisma.rSVP.findMany.mockResolvedValueOnce([]);
        prisma.event.findUnique.mockResolvedValueOnce({ id: 1 });
        prisma.rSVP.create.mockResolvedValueOnce({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "going",
        });
        const response = await agent
            .post("/events/1/rsvp")
            .send({ status: "Going" });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "going",
        });
    });
});