const request = require("supertest");
const server = require("../server");

const { getProfitByPoints, getProfitByDistance, scheduleWithCommutes, schedule } = require("../scheduler");


jest.mock("../scheduler", () => ({
    getProfitByPoints: jest.fn(),
    getProfitByDistance: jest.fn(),
    scheduleWithCommutes: jest.fn(),
    schedule: jest.fn(),
}));

describe("POST /events/schedule", () => {
    let agent;
    beforeEach(async () => {
        agent = request.agent(server);
    });
    it("should return 400 if validation fails", async () => {

        const response = await agent.post("/events/schedule").send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("is required");
    });

    it("should return 400 if distance profit mode is selected without user location", async () => {

        const response = await agent.post("/events/schedule").send({
            events: [{ id: 1, name: "Event 1" }],
            profitModes: ["distance"],
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain("Cannot get distance profit without user location");
    });

    it("should schedule events without commute", async () => {
        schedule.mockResolvedValueOnce([{ id: 1, name: "Event 1" }]);

        const response = await agent.post("/events/schedule").send({
            events: [{ id: 1, name: "Event 1" }],
            profitModes: ["points"],
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: "Event 1" }]);
    });

    it("should schedule events with commute", async () => {
        scheduleWithCommutes.mockResolvedValueOnce([{ id: 1, name: "Event 1" }]);

        const response = await agent.post("/events/schedule?commute=true").send({
            events: [{ id: 1, name: "Event 1" }],
            profitModes: ["points"],
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: "Event 1" }]);
    });
});