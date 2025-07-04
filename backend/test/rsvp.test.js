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

describe("GET /events/:id/rsvp", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
    });

    it("should return 400 if event ID is not an integer", async () => {
        const response = await agent.get("/events/notAnInteger/rsvp");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "ID of the event has to be an integer"
        );
    });

    it("should return an empty array if RSVP does not exist", async () => {
        prisma.rSVP.findMany.mockResolvedValueOnce([]);
        const response = await agent.get("/events/1/rsvp");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("should return the RSVP if it exists", async () => {
        const mockRSVP = {
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "going",
        };
        prisma.rSVP.findMany.mockResolvedValueOnce([mockRSVP]);
        const response = await agent.get("/events/1/rsvp");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRSVP);
    });
});

describe("PATCH /events/:id/checkin", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
    });

    it("should return 400 if event ID is not an integer", async () => {
        const response = await agent.patch("/events/notAnInteger/checkin");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "ID of the event has to be an integer"
        );
    });

    it("should return 404 if RSVP does not exist", async () => {
        prisma.rSVP.findMany.mockResolvedValueOnce([]);
        const response = await agent.patch("/events/1/checkin");
        expect(response.status).toBe(404);
        expect(response.body.message).toContain(
            "The rsvp with the specified IDs does not exist"
        );
    });

    it("should update the RSVP with check-in time and return it", async () => {
        const mockRSVP = {
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "going",
            check_in_time: null,
        };
        const updatedRSVP = {
            ...mockRSVP,
            check_in_time: new Date(Date.now()),
        };
        prisma.rSVP.findMany.mockResolvedValueOnce([mockRSVP]);
        prisma.rSVP.update.mockResolvedValueOnce(updatedRSVP);

        const response = await agent.patch("/events/1/checkin");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "going",
            check_in_time: expect.any(String), // Check that check_in_time is a string (ISO format)
        }));
    });
});