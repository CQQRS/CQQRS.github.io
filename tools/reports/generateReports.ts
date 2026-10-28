import path from "node:path";

import { Report } from "./Report";
import { Edition } from "./Edition";
import { UsageError } from "./Types";
import { environment } from "./environment";
import type { IApiReport } from "./IApiReport";
import { ApiReportToReportConvertor } from "./ApiReportToReportConvertor";
import type { QSO } from "./QSO";
import { ReverseLog } from "./ReverseLog";
import { LogTableBuilder } from "./LogTableBuilder";
import { loadMemberDirectory, type IMemberEntry } from "./MemberDirectory";

try {

	if (Bun.argv.length < 3) {
		//throw new UsageError("No edition specified");

	}

	//const edition = new Edition(Bun.argv[2]!);
	const edition = new Edition("2026/44");

	const reportList = await loadReports(edition);

	const log = new Map<string, QSO[]>();
	reportList.map(v => {
		const qsoList = log.getOrInsert(v.callsign, []);
		qsoList.push(...v.qsoList);
	});

	const reverseLog = new ReverseLog(log).log;
	
	const memberDirectory = await loadMemberDirectory();
	const filteredReverseLog = new Map(
		[...reverseLog]
			.filter(([k, v]) => memberDirectory.has(k))
	);

	const table = new LogTableBuilder(log).buildHtmlPage();
	const tableR = new LogTableBuilder(reverseLog).buildHtmlPage();
	const tableRF = new LogTableBuilder(filteredReverseLog).buildHtmlPage();

	Bun.write("c:/users/lance/temp/log.html", table);
	Bun.write("c:/users/lance/temp/logR.html", tableR);
	Bun.write("c:/users/lance/temp/logRF.html", tableRF);

}
catch (ex: any) {

	if (ex instanceof UsageError) {
		console.error(ex.message);
		console.log();
		console.log(`Usage: downloadReports <year>/<week>`);
		console.log(`\t eg. downloadReports 2020/44`);
	}
	else {
		console.error(ex);
	}
}

async function loadReports(edition: Edition) {

	const dataPath = path.join(__dirname, `../../`, environment.reportSavePath,
		`${edition.year}_${edition.week}.json`);

	let data: IApiReport[];
	try {
		const file = Bun.file(dataPath);
		data = await file.json();
	}
	catch (ex) {
		throw new Error(`Could not open data file at: ${dataPath}`);
	}

	const reportList: Report[] = [];
	data.map(v =>
		reportList.push(new ApiReportToReportConvertor(v).report)
	);

	return reportList;

}