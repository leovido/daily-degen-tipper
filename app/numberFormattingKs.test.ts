import { describe, expect, it } from "@jest/globals";
import { kFormatter } from "./numberFormattingKs";

describe("K and M formatting numbers", () => {
	it("formatting 1K", () => {
		const expected = "1K";
		const sut = "1000";

		const result = kFormatter(sut);

		expect(result).toBe(expected);
	});

	it("formatting 1039", () => {
		const expected = "1.039K";
		const sut = "1039";

		const result = kFormatter(sut);

		expect(result).toBe(expected);
	});

	it("formatting 8230", () => {
		const expected = "8.23K";
		const sut = "8230";

		const result = kFormatter(sut);

		expect(result).toBe(expected);
	});
});
