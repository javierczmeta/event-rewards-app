const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        rSVP: {
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn()
        },
        event: {
            findUnique: jest.fn(),
            update: jest.fn()
        },
        profile: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock("../utils", () => ({
    calculateRewards: jest.fn().mockReturnValue(100), // Mock return value
}));

const { PrismaClient } = require("../generated/prisma");
const { updatePoints } = require("../prismaMiddleware");
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
        prisma.event.findUnique.mockResolvedValueOnce({id:1})
        prisma.rSVP.findMany.mockResolvedValueOnce([{id:1}])
        const response = await agent
            .post("/events/1/rsvp")
            .send({ invalidField: "invalidValue", status: "Going" });
        expect(response.status).toBe(400);
        expect(response.body.message).toBeDefined();
    });

    it("should return 400 if event ID is not an integer", async () => {
        const response = await agent
            .post("/events/notAnInteger/rsvp")
            .send({ status: "Going" });
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("has to be an integer");
    });
    it("should return 404 if event does not exist", async () => {
        prisma.rSVP.findFirst.mockResolvedValueOnce(null);
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
        prisma.rSVP.findFirst.mockResolvedValueOnce({ id: 1 });
        prisma.event.findUnique.mockResolvedValueOnce({ id: 1 });
        prisma.rSVP.update.mockResolvedValueOnce({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "Going",
        });

        const response = await agent
            .post("/events/1/rsvp")
            .send({ status: "Going" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "Going",
        });
    });
    it("should create a new RSVP and return it", async () => {
        prisma.rSVP.findFirst.mockResolvedValueOnce(null);
        prisma.event.findUnique.mockResolvedValueOnce({ id: 1 });
        prisma.rSVP.create.mockResolvedValueOnce({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "Going",
        });
        const response = await agent
            .post("/events/1/rsvp")
            .send({ status: "Going" });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "Going",
        });
    });
    it("should return 400 if already checked in", async () => {
        prisma.rSVP.findFirst.mockResolvedValueOnce({
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "Going",
            check_in_time: new Date(Date.now())
        });
        prisma.event.findUnique.mockResolvedValueOnce({ id: 1 });
        const response = await agent
            .post("/events/1/rsvp")
            .send({ status: "Going" });
            
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("already checked in");
    });
});

describe("GET /events/:id/rsvp", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
        jest.resetAllMocks()
    });

    it("should return 400 if event ID is not an integer", async () => {
        const response = await agent.get("/events/notAnInteger/rsvp");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("has to be an integer");
    });

    it("should return an empty array if RSVP does not exist", async () => {
        prisma.rSVP.findFirst.mockResolvedValueOnce(null);
        prisma.event.findUnique.mockResolvedValueOnce({id:1})
        const response = await agent.get("/events/1/rsvp");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("should return the RSVP if it exists", async () => {
        const mockRSVP = {
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "Going",
        };
        prisma.rSVP.findFirst.mockResolvedValueOnce(mockRSVP);
        prisma.event.findUnique.mockResolvedValueOnce({id:1})
        const response = await agent.get("/events/1/rsvp");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockRSVP);
    });
});

describe("PATCH /events/:eventid/checkin/:userid", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
        jest.resetAllMocks();
    });

    it("should return 400 if event ID is not an integer", async () => {
        const response = await agent.patch("/events/notAnInteger/checkin/1");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("has to be an integer");
    });

    it("should return 400 if user ID is not an integer", async () => {
        const response = await agent.patch("/events/1/checkin/notAnInteger");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("has to be an integer");
    });

    it("should return 401 if the session user is not the organizer", async () => {
        prisma.event.findUnique.mockResolvedValueOnce({
            id: 1,
            organizer_id: 2, // Different from session user ID
        });
        prisma.rSVP.findFirst.mockResolvedValueOnce({ id: 1 });
        const response = await agent.patch("/events/1/checkin/1");
        expect(response.status).toBe(401);
        expect(response.body.message).toContain(
            "Only the organizer can check in people."
        );
    });

    it("should return 404 if the event does not exist", async () => {
        prisma.event.findUnique.mockResolvedValueOnce(null);
        prisma.rSVP.findMany.mockResolvedValueOnce([{ id: 1 }]);
        const response = await agent.patch("/events/1/checkin/1");
        expect(response.status).toBe(404);
        expect(response.body.message).toContain(
            "The event with the specified ID does not exist"
        );
    });

    it("should return 404 if RSVP does not exist", async () => {
        prisma.event.findUnique.mockResolvedValueOnce({
            id: 1,
            organizer_id: 1, // Same as session user ID
        });
        prisma.rSVP.findFirst.mockResolvedValueOnce(null);
        const response = await agent.patch("/events/1/checkin/1");
        expect(response.status).toBe(404);
        expect(response.body.message).toContain(
            "RSVP data for this user and event does not exist"
        );
    });

    it("should return 400 if user status is 'Not Going'", async () => {
        prisma.event.findUnique.mockResolvedValueOnce({
            id: 1,
            organizer_id: 1, // Same as session user ID
        });
        prisma.rSVP.findFirst.mockResolvedValueOnce({
            id: 1,
            status: "Not Going",
        });
        const response = await agent.patch("/events/1/checkin/1");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "User has to change status before checking in."
        );
    });

    it("should return 409 if user is already checked in", async () => {
        prisma.event.findUnique.mockResolvedValueOnce({
            id: 1,
            organizer_id: 1, // Same as session user ID
        });
        prisma.rSVP.findFirst.mockResolvedValueOnce({
            id: 1,
            status: "Going",
            check_in_time: new Date(Date.now()),
        });
        const response = await agent.patch("/events/1/checkin/1");
        expect(response.status).toBe(409);
        expect(response.body.message).toContain(
            "User already checked in!"
        );
    });

    it("should update the RSVP with check-in time and return it", async () => {
        const mockRSVP = {
            id: 1,
            user_id: 1,
            event_id: 1,
            status: "Going",
            check_in_time: null,
        };
        const updatedRSVP = {
            ...mockRSVP,
            check_in_time: new Date(Date.now()),
        };
        prisma.event.findUnique.mockResolvedValueOnce({
            id: 1,
            organizer_id: 1, // Same as session user ID
        });
        prisma.rSVP.findFirst.mockResolvedValueOnce(mockRSVP);
        prisma.rSVP.update.mockResolvedValueOnce(updatedRSVP);

        prisma.rSVP.count.mockResolvedValueOnce(1);
        prisma.event.findUnique.mockResolvedValueOnce({ id: 1 });
        prisma.event.update.mockResolvedValueOnce({ id: 1, rewards: 1000 });

        prisma.profile.findUnique.mockResolvedValueOnce({ id: 1, points: 0 });
        prisma.profile.update.mockResolvedValueOnce({ id: 1, points: 1000 });

        const response = await agent.patch("/events/1/checkin/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: 1,
                user_id: 1,
                event_id: 1,
                status: "Going",
                check_in_time: expect.any(String), // Check that check_in_time is a string (ISO format)
            })
        );
    });
});

describe("GET /events/:id/attendees", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        jest.resetAllMocks();
    });

    it("should return 400 if event ID is not an integer", async () => {
        const response = await agent.get("/events/notAnInteger/attendees");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain("has to be an integer");
    });

    it("should return an empty array if no attendees are found", async () => {
        prisma.rSVP.findMany.mockResolvedValueOnce([]);
        prisma.event.findUnique.mockResolvedValueOnce({id:1})
        const response = await agent.get("/events/1/attendees");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("should return the list of attendees if they exist", async () => {
        const mockAttendees = [
            {
                check_in_time: null,
                id: 1,
                user_id: 1,
                event_id: 1,
                status: "Going",
                user: {
                    profile: {
                        name: "John Doe",
                        email: "john@example.com",
                    },
                },
            },
            {
                id: 2,
                user_id: 2,
                event_id: 1,
                status: "Going",
                user: {
                    profile: {
                        name: "Jane Smith",
                        email: "jane@example.com",
                    },
                },
            },
        ];
        prisma.event.findUnique.mockResolvedValueOnce({id:1})
        prisma.rSVP.findMany.mockResolvedValueOnce(mockAttendees);
        const response = await agent.get("/events/1/attendees");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAttendees);
    });
});