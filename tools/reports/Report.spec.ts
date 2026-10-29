import { beforeEach, expect, test, describe } from "bun:test";
import type { IApiReport } from "./IApiReport";
import { Report } from "./Report";
import { ApiReportToReportConvertor } from "./ApiReportToReportConvertor";

describe( "Report", () => {

			// Arrange

			// Act

			//Assesrt

	describe( "reporter callsign", () => {

		test( "should strip whitespace", () => {

			// Arrange

			// Act
			const report = new Report(
				"", "VK7TO ", "", "", "", "", "", "", "", [], "", ""
			);

			// Assert
			expect( report.callsign).toBe("VK7TO");

		});
	});

});