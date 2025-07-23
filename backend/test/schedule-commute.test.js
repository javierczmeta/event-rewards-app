jest.mock('../mapboxFunctions', () => {return{
    calculateCommute: jest.fn()
}});
const { calculateCommute } = require("../mapboxFunctions");
const { scheduleWithCommutes } = require("../scheduler");


describe("scheduleWithCommutes", () => {
    it("should maximize profit without overlapping events", async () => {
        const events = [
            {
                id: 1,
                start_time: "2023-10-01T09:00:00",
                end_time: "2023-10-01T10:00:00",
                profit: 50,
                location: { lng: 0, lat: 0 },
            },
            {
                id: 2,
                start_time: "2023-10-01T10:30:00",
                end_time: "2023-10-01T11:30:00",
                profit: 60,
                location: { lng: 0, lat: 0 },
            },
            {
                id: 3,
                start_time: "2023-10-01T12:00:00",
                end_time: "2023-10-01T13:00:00",
                profit: 70,
                location: { lng: 0, lat: 0 },
            },
        ];
        calculateCommute.mockResolvedValue({time: 3, route: null})
        const result = await scheduleWithCommutes(events);
        expect(result.selectedEventIds).toEqual([3]); 
    });
});
