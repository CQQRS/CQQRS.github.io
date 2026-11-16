import { beforeEach, expect, test, describe } from "bun:test";

import { Callsign } from "./Callsign";

describe("Callsign", () => {
	describe("Extracts parts", () => {
		const tests = [
			{ callsign: "VK0AA", root: "VK0AA", prefix: "", suffix: "" },
			{ callsign: "VK0AA/P", root: "VK0AA", prefix: "", suffix: "P" },
			{ callsign: "VK3/VK0AA/P", root: "VK0AA", prefix: "VK3", suffix: "P" },
			{ callsign: "VK3/VK0A/P", root: "VK0A", prefix: "VK3", suffix: "P" },
			{ callsign: "VK3/VK0A", root: "VK0A", prefix: "VK3", suffix: "" },
		];

		tests.forEach((testItem) => {
			test(`Extracts ${testItem.callsign}`, () => {
				// Arrange
				const callsign = new Callsign(testItem.callsign);

				// Act
				const root = callsign.root;
				const prefix = callsign.prefix;
				const suffix = callsign.suffix;

				// Assert
				expect(root).toEqual(testItem.root);
				expect(prefix).toEqual(testItem.prefix);
				expect(suffix).toEqual(testItem.suffix);
			});
		});
	});

	test("Uses whole callsign as roon on invalid callsign", () => {
		// Arrange
		const callString = "VK0AA/VK3/P";

		// Act
		const callsign = new Callsign(callString);

		// Assert
		expect(callsign.root).toEqual(callString);
	});

	test("provicdes a toString() method", () => {
		// Arrange
		const callsign = new Callsign("VK3/VK0AA/P");

		// Act
		const result = callsign.toString();

		// Assert
		expect(result).toEqual("VK3/VK0AA/P");
	});
});
