const { schedule } = require("../scheduler");

describe("schedule function - maximize profit without overlapping events", () => {
    test("TEST 0: Overlapping high profit vs multiple low profit events", () => {
        const events = [
            { id: 1, start_time: 1, end_time: 10, profit: 100 },
            { id: 2, start_time: 1, end_time: 3, profit: 30 },
            { id: 3, start_time: 3, end_time: 6, profit: 30 },
            { id: 4, start_time: 6, end_time: 10, profit: 50 },
        ];
        const result = schedule(events);
        expect(result.selectedEventIds.sort()).toEqual([2, 3, 4]);
        expect(result.totalProfit).toBe(110);
    });

    test("TEST 1: Dense overlaps, only one can be chosen", () => {
        const events = [
            { id: 1, start_time: 1, end_time: 5, profit: 10 },
            { id: 2, start_time: 2, end_time: 6, profit: 20 },
            { id: 3, start_time: 3, end_time: 7, profit: 15 },
        ];
        const result = schedule(events);
        expect(result.selectedEventIds).toEqual([2]);
        expect(result.totalProfit).toBe(20);
    });

    test("TEST 2: Greedy trap - picking highest profit is not optimal", () => {
        const events = [
            { id: 1, start_time: 1, end_time: 4, profit: 5 },
            { id: 2, start_time: 4, end_time: 7, profit: 5 },
            { id: 3, start_time: 1, end_time: 7, profit: 9 },
        ];
        const result = schedule(events);
        expect(result.selectedEventIds.sort()).toEqual([1, 2]);
        expect(result.totalProfit).toBe(10);
    });

    test("TEST 3: Large input, many small overlaps", () => {
        const events = [];
        for (let i = 0; i < 100; i++) {
            events.push({
                id: i + 1,
                start_time: i,
                end_time: i + 2,
                profit: 1,
            });
        }
        const result = schedule(events);
        // Expect to pick every other event for max profit = 50
        expect(result.totalProfit).toBe(50);
        // Check that no two selected events overlap
        for (let i = 1; i < result.selectedEventIds.length; i++) {
            const prev = events.find(
                (e) => e.id === result.selectedEventIds[i - 1]
            );
            const curr = events.find(
                (e) => e.id === result.selectedEventIds[i]
            );
            expect(curr.start_time).toBeGreaterThanOrEqual(prev.end_time);
        }
    });

    test("TEST 4: Events with same start/end time, different profits", () => {
        const events = [
            { id: 1, start_time: 1, end_time: 3, profit: 10 },
            { id: 2, start_time: 1, end_time: 3, profit: 20 },
            { id: 3, start_time: 3, end_time: 5, profit: 15 },
        ];
        const result = schedule(events);
        expect(result.selectedEventIds.sort()).toEqual([2, 3]);
        expect(result.totalProfit).toBe(35);
    });

    test("TEST 5: Nested events", () => {
        const events = [
            { id: 1, start_time: 1, end_time: 10, profit: 10 },
            { id: 2, start_time: 2, end_time: 3, profit: 5 },
            { id: 3, start_time: 4, end_time: 5, profit: 5 },
            { id: 4, start_time: 6, end_time: 7, profit: 5 },
            { id: 5, start_time: 8, end_time: 9, profit: 5 },
        ];
        const result = schedule(events);
        expect(result.selectedEventIds.sort()).toEqual([2, 3, 4, 5]);
        expect(result.totalProfit).toBe(20);
    });

    test("TEST 6: All events non-overlapping", () => {
        const events = [
            { id: 1, start_time: 1, end_time: 2, profit: 1 },
            { id: 2, start_time: 3, end_time: 4, profit: 2 },
            { id: 3, start_time: 5, end_time: 6, profit: 3 },
        ];
        const result = schedule(events);
        expect(result.selectedEventIds.sort()).toEqual([1, 2, 3]);
        expect(result.totalProfit).toBe(6);
    });
});
