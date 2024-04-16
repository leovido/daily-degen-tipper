// client.test.ts

import { client } from "../neynarClient"; // Adjust the import path according to your file structure

// Mocking the external neynarClient and its methods
jest.mock("../neynarClient", () => ({
	client: {
		fetchAllCastsCreatedByUser: jest.fn().mockReturnValue({
			result: {
				casts: [{ timestamp: new Date() /* other properties */ }]
			}
		}),
		fetchBulkUsers: jest.fn().mockReturnValue({
			users: [
				{ username: "testUser" /* other properties */ }
				// Add mock user objects as needed
			]
		})
	}
}));

describe("client function", () => {
	it("successfully processes valid input", async () => {
		const result = await client(203666, new Date());

		expect(result).toEqual([
			{ username: "testUser", hamValue: "🍖 x 20", timestamp: "123123123" }
		]);
	});
});
