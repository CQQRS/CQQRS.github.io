import path from 'node:path';
import { google } from 'googleapis';
import fs from 'node:fs/promises';
import { UserResponse } from './UserResponse';
import type { IGoogleFormResponse, IResponse } from './IGoogleFormResponse';
import { JSDOM } from "jsdom";
import { ReportType, type IReport } from './IReport';

// TODO: Replace with a valid form ID.
const formID = '1A5nPtCcZRMualQ7y6YIcNNHM8_LQQbLL06dEOsBQwd4';
const responsePath = path.join(__dirname, 'responses.json');
const htmlPath = path.join(__dirname, 'output.html');

enum Question {
	QTH, 
	Name, 
	Callsign,
	Worked40, 
	Heard40, 
	Worked80, 
	Heard80, 
	Comment40, 
	CommentOther
}

/**
 * Retrieves all responses from a form.
 */
async function getAllResponses(): Promise<IGoogleFormResponse> {
	
	const keyfilePath = path.join(__dirname, 'credentials.json');
	
	const auth = new google.auth.GoogleAuth({
	keyFile: keyfilePath,
	scopes: [
		'https://www.googleapis.com/auth/forms.body.readonly',
		'https://www.googleapis.com/auth/forms.responses.readonly'
	]
	});

	// Create a new Forms API client.
	const formsClient = google.forms({
		version: 'v1',
		auth,
	});

	// Get the list of responses for the form.
	const result = await formsClient.forms.responses.list({
		formId: formID,
	});

	await fs.writeFile(responsePath, JSON.stringify(result));

	return result as unknown as IGoogleFormResponse;
	
}

async function loadData( filePath: string ): Promise<IGoogleFormResponse> {

	const content = await fs.readFile(filePath, 'utf8');
	return JSON.parse(content);

}

//const respose = await getAllResponses();
const respose = await loadData( responsePath);

const userResponseList: UserResponse[] = [];

respose.data.responses.map((resp: IResponse)=> {

	const userResponse = new UserResponse(resp);
	userResponseList.push(userResponse);
});

userResponseList.map( v => v.print());

let stationsOnAir = transformUserResponsesToReportedBy(userResponseList);
const stationsOnAirCount = stationsOnAir.size;

//filter stationsOnAir to only those who submitted reports
const reporters = userResponseList.map(v=> v.Callsign);
stationsOnAir = new Map( [...stationsOnAir.entries()].filter( v=> 
	reporters.includes(v[0])));

console.log(`${stationsOnAirCount} stations heard by ${reporters.length} reporters`);
console.log( "Reporters: ");
console.log( reporters.sort().join( ", "));

//Sort by station CS
stationsOnAir = new Map( [...stationsOnAir.entries()].sort((a,b)=> 
	a[0].localeCompare(b[0])));

//Sort by band, type, callsign length.
stationsOnAir.forEach(reportList=> {
	reportList.sort((a,b)=> {
		//first non-zero value dictates the sort.
		return b.band - a.band ||
			b.type.toString().localeCompare(a.type.toString()) ||
			a.callsign.length - b.callsign.length;
	});
});

writeHtmlTable(stationsOnAir);
	

function writeHtmlTable( stations: Map<string,IReport[]> ) {

	const dom = new JSDOM(`<!DOCTYPE html><body><table id="report-table"><tbody id="tbody"></tbody></table></body>`);
	const document = dom.window.document;
	const style = document.createElement("style");
	style.textContent = getStyle();
	document.head.appendChild(style);

	const bandList = [40, 80, 160, 30, 20, 17, 15, 12, 10, 6];

	let tbody = document.querySelector("tbody");

	const header = buildHeaderRow(document, 7);
	tbody.appendChild(header);

	
	stations.forEach((reportList, stationCs) => {
		
		qsoListToTable(document, tbody, reportList, stationCs, bandList );
	})


	const html = document.documentElement.outerHTML;
	fs.writeFile(htmlPath, html);

};

/*
	Outputs reponses grouped by each station, followed by who worked or heard
	them.

	If a station reported working another station, that report should be in
	both stations' list
*/
function transformUserResponsesToReportedBy( reportList: UserResponse[]): 
	Map<string,IReport[]> {

		const output = new Map<string,IReport[]>();

		reportList
		.map(reporter => {
			reporter.reportList.forEach( report => {
				const hearer = output.getOrInsert(report.callsign, []);
				
				if( !hearer.find(v=> v.callsign == reporter.Callsign
					&& v.band == report.band
				)) {
					hearer.push({
						band: report.band,
						callsign: reporter.Callsign,
						type: report.type
					});
				}

				if( report.type === ReportType.Worked) {
					//Ensure the reporter has it in their list too.
					const reporterOut = output.getOrInsert(reporter.Callsign, []);
					
					if( !reporterOut.find(v=> v.callsign == report.callsign
						&& v.band == report.band
					)) {
						reporterOut.push({
							band: report.band,
							callsign: report.callsign,
							type: report.type
						});
					}
				}

			});
		});

		return output;
}

function qsoListToTable( document: HTMLDocument, tbody: HTMLElement, 
	list: IReport[], station: string, bandList: number[]) {

	const columnCount = 7;

	const rowCount = Math.floor(list.length / columnCount) + 1;
	
	const rowList: HTMLTableRowElement[] = [];
	for( let cI=0; cI<rowCount; cI++) {
		const row = document.createElement("tr");
		rowList.push(row);
		tbody.appendChild(row);

		if( cI == 0 ) {
			row.classList += "new-station";
		}
	}

	const stationCell = document.createElement("td");
	stationCell.textContent = station;
	stationCell.rowSpan = rowCount;

	rowList[0]!.appendChild(stationCell);

	const cellCount = (columnCount * rowCount)-rowCount;
	for( let cI=0; cI< cellCount; cI++) {
		
		let report, cssClass;
			
		const cell = document.createElement("td");
		
		if( report = list[cI]) {

			cssClass = report.type == ReportType.Heard
				? "heard"
				: "worked";

			cell.textContent  = report.callsign;
			cell.className = `report band-${report.band} ${cssClass}`;
			cell.title = `${cssClass} on ${report.band} m`;
		}

		const rowIndex = (cI % rowCount + rowCount) % rowCount;
		rowList[rowIndex]!.appendChild(cell);
	}

}

function buildHeaderRow( doc: HTMLDocument, columnCount: number ) {

	const stationCell = doc.createElement("th");
	stationCell.textContent = "Station";

	const titleCell = doc.createElement("th");
	titleCell.textContent = "Where was I heard?"
	titleCell.colSpan = columnCount-1;

	const rowEl = doc.createElement("tr");
	rowEl.appendChild(stationCell);
	rowEl.appendChild(titleCell);

	return rowEl;
	
}

function getBandHeader( doc: HTMLDocument, bandList: number[]){

	const cellVals = [ "", ...bandList];
	const rowEl = doc.createElement("tr");

	cellVals.map(v=> {
		const cell = doc.createElement("td");
		cell.textContent = v.toString();
		cell.className = `band-${v} header`;

		rowEl.appendChild(cell);
	});

	return rowEl;
}

function getStyle() {

	const out = `

		#report-table {
			//border-collapse: collapse;
			//border: 1px solid #ccc;
			font-family: Verdana, Arial;
			border-spacing: 6px;
			font-size: 0.8em;
		}

		#report-table tr.new-station {
		
		}
		
		#report-table td, #report-table th {
			border: 1px solid #eee;
			background-color: #fdfdfd;
			margin: 6px;
			white-space: nowrap
		}

		#report-table .header {
			font-weight: bold;
		}

		#report-table .report {
			border-left: 10px solid #fff;
			border-radius: 5px 0 0 5px;
		}
		
		#report-table .worked {
			font-weight: bold;
		}

		#report-table .band-160 {
			border-left-color: #f2cc8f;
		}
			
		#report-table .band-80 {
			border-left-color: #81b29a;
		}
			
		#report-table .band-40 {
			border-left-color: #3d405b;
		}
			
		#report-table .band-30 {
			border-left-color: #e07a5f;
		}
			
		#report-table .band-20 {
			border-left-color: #fb5607;
		}
			
		#report-table .band-17 {
			border-left-color: #f4f1de;
		}
			
		#report-table .band-15 {
			border-left-color: #f4f1de;
		}
			
		#report-table .band-12 {
			border-left-color: #f4f1de;
		}
			
		#report-table .band-10 {
			border-left-color: #f4f1de;
		}
			
		#report-table .band-6 {
			border-left-color: #f4f1de;
		}
		
	`;

	return out;
}