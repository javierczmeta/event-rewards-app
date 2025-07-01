const request = require("supertest");
const server = require("../server");

// Mock the PrismaClient
jest.mock("../generated/prisma", () => {
    const mPrismaClient = {
        event: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
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

describe("GET /events", () => {
    beforeEach(() => {
        prisma.event.findMany.mockReset();
    });

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

    it("should sort events by name", async () => {
        const mockEvents = [
            {
                name: "Event B",
                start_time: "2023-10-02",
                created_at: "2023-09-02",
                rewards: 20,
            },
            {
                name: "Event A",
                start_time: "2023-10-01",
                created_at: "2023-09-01",
                rewards: 10,
            },
        ];
        prisma.event.findMany.mockResolvedValue(mockEvents);
        const response = await request(server).get("/events?sort=name");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                name: "Event A",
                start_time: "2023-10-01",
                created_at: "2023-09-01",
                rewards: 10,
            },
            {
                name: "Event B",
                start_time: "2023-10-02",
                created_at: "2023-09-02",
                rewards: 20,
            },
        ]);
    });

    it("should sort events by start time", async () => {
        const mockEvents = [
            {
                name: "Event A",
                start_time: "2023-10-01",
                created_at: "2023-09-01",
                rewards: 10,
            },
            {
                name: "Event B",
                start_time: "2023-10-02",
                created_at: "2023-09-02",
                rewards: 20,
            },
        ];
        prisma.event.findMany.mockResolvedValue(mockEvents);
        const response = await request(server).get("/events?sort=start");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                name: "Event B",
                start_time: "2023-10-02",
                created_at: "2023-09-02",
                rewards: 20,
            },
            {
                name: "Event A",
                start_time: "2023-10-01",
                created_at: "2023-09-01",
                rewards: 10,
            },
        ]);
    });

    it("should sort events by posting time", async () => {
        const mockEvents = [
            {
                name: "Event B",
                start_time: "2023-10-02",
                created_at: "2023-09-02",
                rewards: 20,
            },
            {
                name: "Event A",
                start_time: "2023-10-01",
                created_at: "2023-09-01",
                rewards: 10,
            },
        ];
        prisma.event.findMany.mockResolvedValue(mockEvents);
        const response = await request(server).get("/events?sort=posting");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                name: "Event A",
                start_time: "2023-10-01",
                created_at: "2023-09-01",
                rewards: 10,
            },
            {
                name: "Event B",
                start_time: "2023-10-02",
                created_at: "2023-09-02",
                rewards: 20,
            },
        ]);
    });

    it("should sort events by points", async () => {
        const mockEvents = [
            {
                name: "Event A",
                start_time: "2023-10-01",
                created_at: "2023-09-01",
                rewards: 10,
            },
            {
                name: "Event B",
                start_time: "2023-10-02",
                created_at: "2023-09-02",
                rewards: 20,
            },
        ];
        prisma.event.findMany.mockResolvedValue(mockEvents);
        const response = await request(server).get("/events?sort=points");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                name: "Event B",
                start_time: "2023-10-02",
                created_at: "2023-09-02",
                rewards: 20,
            },
            {
                name: "Event A",
                start_time: "2023-10-01",
                created_at: "2023-09-01",
                rewards: 10,
            },
        ]);
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

describe("DELETE /events/:id", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
        await agent.get("/set"); // Simulate setting session
    });
    it("should return 401 if user is not authenticated", async () => {
        const response = await request(server)
            .delete("/events/1")
            .set("Accept", "application/json");
        expect(response.status).toBe(401);
        expect(response.body.error).toContain(
            "You must be logged in to perform this action."
        );
    });
    it("should return 400 if event ID is not an integer", async () => {
        const response = await agent.delete("/events/not-an-integer");
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
            "ID of the event has to be an integer"
        );
    });
    it("should return 404 if no event is found for the user", async () => {
        prisma.event.delete.mockRejectedValue({
            meta: { cause: "No record was found for a delete." },
        });
        const response = await agent.delete("/events/1");
        expect(response.status).toBe(404);
        expect(response.body.message).toContain(
            "No event with the specified ID was found for this user"
        );
    });
    it("should return 500 for other errors", async () => {
        prisma.event.delete.mockRejectedValue(new Error("Some error"));
        const response = await agent.delete("/events/1");
        expect(response.status).toBe(500);
        expect(response.body.message).toContain("Internal server error");
    });
    it("should delete the event and return it if successful", async () => {
        const mockEvent = { id: 1, name: "Test Event" };
        prisma.event.delete.mockResolvedValue(mockEvent);
        const response = await agent.delete("/events/1");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockEvent);
    });
});
