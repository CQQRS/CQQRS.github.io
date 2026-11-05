import path from "node:path";

import { environment } from "./environment";
import type { IApiReport, IApiReportOld } from "./IApiReport";
import { TerminalOutput } from "../TerminalOutput";
import { UsageError } from "./Types";
import { Edition } from "./Edition";
import type { IPhoto } from "./Report";

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
	const report = await response.json() as Partial<IApiReportOld & IApiReport>[];
	const transformed = transformToApiReport(report);

	TerminalOutput.success(` Success \n`);
	return transformed;
}

async function saveReport(report: IApiReport[], edition: Edition) {

	const savePath = path.join(__dirname,`../../`, environment.reportSavePath,
		`${edition.year}_${edition.week}.json`
	);

	Bun.write(savePath, JSON.stringify(report, null, 2));

	TerminalOutput.log(`Reports saved to ${savePath}`);

}

function transformToApiReport( reportList: Partial<IApiReportOld & IApiReport> []): IApiReport[] {

	return reportList.map(v=> {

		if( (v.photo_filename ?? "").length > 0){
			
			const photo: IPhoto = {
				filename: v.photo_filename!,
				mime: v.photo_mime!,
				size: v.photo_size!
			};

			v.photos = [photo];
		}
		else{
			v.photos = v.photos ?? [];
		}

		delete v.photo_filename;
		delete v.photo_mime;
		delete v.photo_size;

		return v as IApiReport;
	});
	

}

function appendLogSuccess(s: string) {
  process.stdout.write(s);
}

function appendLogFail(s: string) {
  process.stdout.write(s);
}