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
import { TerminalOutput } from "../TerminalOutput";
import { SoapboxBuilder } from "./SoapboxBuilder";
import { env } from "node:process";

try {

	if (Bun.argv.length < 3) {
		throw new UsageError("No edition specified");
	}

	const edition = new Edition(Bun.argv[2]!);
	//const edition = new Edition("2026/44");

	const reportList = await loadReports(edition);
	reportList.sort((a, b) => a.callsign.localeCompare(b.callsign));

	const soapbox = new SoapboxBuilder(reportList).buildHtmlPage();
	Bun.write("c:/users/lance/temp/soapbox.html", soapbox);
	TerminalOutput.log(`Soapbox saved to 'c:/users/lance/temp/soapbox.html'\n\n`);

	const log = new Map<string, QSO[]>();
	reportList.map(v => {
		const qsoList = log.getOrInsert(v.callsign, []);
		qsoList.push(...v.qsoList);
	});

	const reverseLog = new ReverseLog(log).log;

	const memberDirectory = await loadMemberDirectory();
	let filteredReverseLog = new Map(
		[...reverseLog]
			.filter(([k, v]) => memberDirectory.has(k))
	);

	//Sort by station CS
	filteredReverseLog = new Map([...filteredReverseLog.entries()]
		.sort((a, b) => a[0].localeCompare(b[0])));

	//Sort by band, type, callsign length.
	filteredReverseLog.forEach(reportList => {
		reportList.sort((a, b) => {
			//first non-zero value dictates the sort.
			return b.band - a.band ||
				b.type.toString().localeCompare(a.type.toString()) ||
				a.callsign.length - b.callsign.length;
		});
	});

	const table = new LogTableBuilder(log).buildHtmlPage();
	const tableR = new LogTableBuilder(reverseLog).buildHtmlPage();
	const tableRF = new LogTableBuilder(filteredReverseLog).buildHtmlPage();

	Bun.write("c:/users/lance/temp/log.html", table);
	Bun.write("c:/users/lance/temp/logR.html", tableR);
	Bun.write("c:/users/lance/temp/logRF.html", tableRF);

	TerminalOutput.log(`Reverse log saved to 'c:/users/lance/temp/logRF.html'\n\n`);

	TerminalOutput.log(`Reports received: \t${log.size} \n`);
	TerminalOutput.log(`Members on air: \t${filteredReverseLog.size} \n`);
	TerminalOutput.log(`Total on air: \t\t${reverseLog.size}\n\n`);

	printContributers(reportList, Bun.argv[3] ?? "");
	
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
	data.map(v => {
		try {
			reportList.push(new ApiReportToReportConvertor(v).report)
		}
		catch (ex) {
			console.warn(`Could not add report for ${v.callsign}`);
		}
	});

	return reportList;

}

function printContributers(reportList: Report[], extras: string) {
	let contributors: string = extras ?? "";
	contributors += " " + environment.ragchewContributingEditors;
	contributors += " " + reportList.map(v=>v.callsign).join(" ");
	let contribList = contributors.split(/[ ,]/)
		.filter(v=> v.trim().length > 0)
		.sort();
	contribList = [...new Set(contribList)]; // make unique
	
	const formatter = new Intl.ListFormat("en", {
	style: "long",
	type: "conjunction",
	});

	var contribText = formatter.format(contribList)


	TerminalOutput.log(`${contribList.length} Contributors:\n`);
	TerminalOutput.log(contribText);
}