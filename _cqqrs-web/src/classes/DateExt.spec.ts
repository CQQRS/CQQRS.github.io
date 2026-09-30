import { expect, test, describe } from "bun:test";
import "./DateExt";

describe("getWeekNr", () => {

	const testDates = [
	
		{ desc: "Jan1", date: new Date(2026, 0, 1), expected: 1 },
		{ desc: "Start of week 25", date: new Date(2025, 0, 5), expected: 1},
		{ desc: "End of week 25", date: new Date(2025, 0, 11), expected: 2},
		{ desc: "Start of week 26", date: new Date(2026, 0, 4), expected: 1},
		{ desc: "End of week 26", date: new Date(2026, 0, 10), expected: 2},
		{ desc: "Start of week 27", date: new Date(2027, 0, 3), expected: 53},
		{ desc: "End of week 27", date: new Date(2027, 0, 9), expected: 1},
		
	]

	testDates.forEach(item => {

		test(item.desc, () => {

			//

			// Act
			const result = item.date.getWeekNumber();
			
			// Assert
			expect(result).toBe(item.expected);
		})
	})

});