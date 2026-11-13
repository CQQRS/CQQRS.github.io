import path from "node:path";

import { Report } from "./Report";
import { Edition } from "./Edition";
import { UsageError } from "./Types";
import { environment } from "./environment";
import type { IApiReport } from "./IApiReport";
import { ApiReportToReportConvertor } from "./ApiReportToReportConvertor";
import { ReverseLog } from "./ReverseLog";
import { LogTableBuilder } from "./LogTableBuilder";
import { loadMemberDirectory } from "./MemberDirectory";
import { TerminalModifier, TerminalOutput } from "../TerminalOutput";
import { SoapboxBuilder } from "./SoapboxBuilder";
import { LogCollection } from "./LogCollection";

try {

	if (Bun.argv.length < 3) {
		throw new UsageError("No edition specified");
	}

	let edition = new Edition(Bun.argv[2]!);
	//edition = new Edition("2026/46");

	const reportList = await loadReports(edition);
	reportList.sort((a, b) => a.callsign.root.localeCompare(b.callsign.root));

	const log = new LogCollection();
	reportList.map(v => {
		log.getOrInsert(v.callsign,v.qsoList);
	});

	const soapbox = new SoapboxBuilder(reportList);
	Bun.write("c:/users/lance/temp/soapbox.md", soapbox.buildHtml());
	Bun.write("c:/users/lance/temp/soapboxPreview.html", soapbox.buildHtmlPage());
	TerminalOutput.log(`Soapbox preview at 'file:///c:/users/lance/temp/soapboxPreview.html'\n`);
	TerminalOutput.log(`Soapbox saved to 'file:///c:/users/lance/temp/soapbox.md'\n\n`);

	const reverseLog = new ReverseLog(log).toLogCollection();

	const memberDirectory = await loadMemberDirectory();
	let filteredReverseLog = reverseLog.filter(v => 
		memberDirectory.has(v.callsign.root));

	//Sort by station CS
	filteredReverseLog.sortByStationsLogCallsign();

	const table = new LogTableBuilder(log).buildHtmlPage();
	const tableR = new LogTableBuilder(reverseLog).buildHtmlPage();
	const tableRF = new LogTableBuilder(filteredReverseLog);

	Bun.write("c:/users/lance/temp/log.html", table);
	Bun.write("c:/users/lance/temp/logR.html", tableR);
	Bun.write("c:/users/lance/temp/logRF.html", tableRF.buildHtmlPage());
	Bun.write("c:/users/lance/temp/logRF.md", tableRF.buildHtml());

	TerminalOutput.log(`Reverse log preview saved to 'file://c:/users/lance/temp/logRF.html'\n`);
	TerminalOutput.log(`Reverse log saved to 'file://c:/users/lance/temp/logRF.md'\n\n`);

	/*
	TerminalOutput.log(`Reports received: \t${log.size} \n`);
	TerminalOutput.log(`Members on air: \t${filteredReverseLog.size} \n`);
	TerminalOutput.log(`Total on air: \t\t${reverseLog.size}\n\n`);
	*/

	const outputText = `${log.size} reports were received, showing `
		+ `${filteredReverseLog.size} CQQRS members who worked and heard `
		+ `${reverseLog.size} stations!`;

	TerminalOutput.log(`${outputText}\n\n`, [TerminalModifier.Blue]);

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


	TerminalOutput.log(`${contribList.length} Contributors:\n`, [TerminalModifier.Blue]);
	TerminalOutput.log(contribText, [TerminalModifier.Blue]);
}