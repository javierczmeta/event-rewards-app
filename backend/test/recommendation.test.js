const {
    calculateCategoryWeights,
    probabilityGoing,
} = require("../recommendation");
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

describe("calculateCategoryWeights", () => {
    it("should calculate category weights correctly", async () => {
        prisma.rSVP.findMany
            .mockResolvedValueOnce([
                { event: { category: "Music and Arts" } },
                { event: { category: "Music and Arts" } },
                { event: { category: "Music and Arts" } },
                { event: { category: "Sports and Fitness" } },
            ])
            .mockResolvedValueOnce([
                { event: { category: "Food and Drink" } },
                { event: { category: "Music and Arts" } },
            ]);

        const weights = await calculateCategoryWeights(1);

        expect(weights).toHaveProperty("Music and Arts");
        expect(weights).toHaveProperty("Sports and Fitness");
        expect(weights).toHaveProperty("Food and Drink");
        expect(weights["Music and Arts"]).toBeGreaterThan(
            weights["Sports and Fitness"]
        );
        expect(weights["Music and Arts"]).toBeGreaterThan(
            weights["Food and Drink"]
        );
    });

    it("should return equal weights for all categories if no events", async () => {
        prisma.rSVP.findMany
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const weights = await calculateCategoryWeights(1);

        const categories = Object.keys(weights);
        const firstWeight = weights[categories[0]];
        categories.forEach((category) => {
            expect(weights[category]).toBeCloseTo(firstWeight);
        });
    });
});

describe("probabilityGoing", () => {
    jest.resetAllMocks();
    it("should calculate probability of going correctly", async () => {
        prisma.rSVP.findMany
            .mockResolvedValueOnce([{ user_id: 2 }, { user_id: 3 }]) // E_G
            .mockResolvedValueOnce([{ user_id: 4 }]) // E_N
            .mockResolvedValueOnce([{ event_id: 1 }]) 
            .mockResolvedValueOnce([{ event_id: 1 }]) 
            .mockResolvedValueOnce([{ event_id: 2 }]) 
            .mockResolvedValueOnce([{ event_id: 1 }]) 
            .mockResolvedValueOnce([{ event_id: 2 }]) 
            .mockResolvedValueOnce([{ event_id: 2 }]) 
            .mockResolvedValueOnce([]) 
            .mockResolvedValueOnce([])  
            .mockResolvedValueOnce([]) 
            .mockResolvedValueOnce([]) 
            .mockResolvedValueOnce([]) 
            .mockResolvedValueOnce([]); 

        const probability = await probabilityGoing(1, 1);

        expect(probability).toBeGreaterThan(0);
    });

    it("should return 0 if no attendees", async () => {
        prisma.rSVP.findMany
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const probability = await probabilityGoing(1, 1);

        expect(probability).toBe(0);
    });
});
