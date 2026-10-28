import path from "node:path";

import { environment } from "./environment";
import type { IApiReport } from "./IApiReport";
import { TerminalOutput } from "../TerminalOutput";
import { UsageError } from "./Types";
import { Edition } from "./Edition";

try{
	
	if( Bun.argv.length < 3) {
		throw new UsageError("No edition specified");
	}

	const edition = new Edition(Bun.argv[2]!);
	const report = await download(edition);
	saveReport(report, edition);


}
catch( ex: any) {

	if( ex instanceof UsageError ) {
		console.error(ex.message);
		console.log();
		console.log(`Usage: downloadReports <year>/<week>`);
		console.log(`\t eg. downloadReports 2020/44`);
	}
	else{
		console.error(ex.message);
	}
}

async function download(edition: Edition): Promise<IApiReport[]> {
	const url = 
		`${environment.reportApiRoot}/${edition.year}_${edition.week}/entries.json`;
	
	TerminalOutput.log(`Downloading report from ${url} ...`);

	const response = await fetch( url);
	if( !response.ok) {
		TerminalOutput.error(` FAILED \n`);
		throw new Error(`Could not download report.  ${response.statusText} (${response.status})`);
	}
	const report: IApiReport[] = await response.json() as IApiReport[];

	TerminalOutput.success(` Success \n`);
	return report;
}

async function saveReport(report: IApiReport[], edition: Edition) {

	const savePath = path.join(__dirname,`../../`, environment.reportSavePath,
		`${edition.year}_${edition.week}.json`
	);

	Bun.write(savePath, JSON.stringify(report, null, 2));

	TerminalOutput.log(`Reports saved to ${savePath}`);

}

function appendLogSuccess(s: string) {
  process.stdout.write(s);
}

function appendLogFail(s: string) {
  process.stdout.write(s);
}