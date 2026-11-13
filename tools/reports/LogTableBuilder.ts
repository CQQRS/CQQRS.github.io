import jsdom, { VirtualConsole } from "jsdom";
const {JSDOM} = jsdom;

import juice from "juice";

import { QSO, QSOType } from "./QSO";
import type { LogCollection } from "./LogCollection";
import type { Callsign } from "../../models/Callsign";

export class LogTableBuilder {

	private readonly _columnCount: number = 10

	public constructor(private _log: LogCollection, 
		private _options: ILogTableBuilderOptions = {}) {
	}

	/*
	* returns a standalone HTML page with the log table embedded
	*/
	
	public buildHtmlPage(): string {

		const table = this.buildHtml();
		return `<!DOCTYPE html><head><meta charset="UTF-8"></head><body bgcolor="#cccccc">${table}</body>`
	}

	/*
	* returns a string containing an html table with the log
	* 
	*/
	public buildHtml(): string {

		const virtualConsole = this.getJSDOMConsole();
		const dom = new JSDOM(`<div class="logtable-root"><table class="report-table"><tbody id="tbody"></tbody></table></div>`, {virtualConsole});
		
		const document = dom.window.document;
		const style = document.createElement("style");
		style.textContent = this.getStyle();
		const contentRoot = document.querySelector(".logtable-root")!;
		contentRoot.appendChild(style);

		const bandList = [40, 80, 160, 30, 20, 17, 15, 12, 10, 6];

		let tbody = document.querySelector("tbody")!;

		if( !(this._options.suppressTitle ?? false)) {
			const header = this.buildHeaderRow(document);
			tbody.appendChild(header);
		}

		let altLog = false;
		this._log.forEach((stationLog) => {

			stationLog.sortQsoList();

			this.qsoListToTable(document, tbody, stationLog.qsoList, stationLog.callsign, bandList,
				altLog
			);
			altLog = !altLog;
		})

		const html = contentRoot.outerHTML;
		
		const inlined = juice(html, {removeStyleTags: true});
		
		return inlined;
	};

	private getJSDOMConsole(): VirtualConsole {

		const virtualConsole = new jsdom.VirtualConsole();
		virtualConsole.on("jsdomError", (err) => {
			if (err.message !== "Could not parse CSS stylesheet") {
				console.error(err.message);
			}
		});

		return virtualConsole;

	}

	private buildHeaderRow(doc: HTMLDocument) {

		const stationCell = doc.createElement("th");
		stationCell.textContent = "Station";

		const titleCell = doc.createElement("th");
		
		const title = `
			Who <span class="worked">Worked</span>, 
			<span class="tried">Tried</span> and 
			<span class="heard">Heard</span> each station
			<br />
			on 
			<span class="band-160">⬤</span>160 
			<span class="band-80">⬤</span>80
			<span class="band-40">⬤</span>40
			<span class="band-30">⬤</span>30
			<span class="band-20">⬤</span>20
			<span class="band-10">⬤</span>Other
			?`;

		titleCell.innerHTML = `${title}`;
		titleCell.colSpan = this._columnCount - 1;

		const rowEl = doc.createElement("tr");
		rowEl.appendChild(stationCell);
		rowEl.appendChild(titleCell);

		return rowEl;

	}

	private qsoListToTable(document: HTMLDocument, tbody: HTMLElement, 
		qsoList: QSO[], station: Callsign, bandList: number[], 
		altLog: boolean = false) {

		const columnCount = this._columnCount;

		const rowCount = Math.floor(qsoList.length / columnCount) + 1;

		const rowList: HTMLTableRowElement[] = [];
		for (let cI = 0; cI < rowCount; cI++) {
			const row = document.createElement("tr");
			rowList.push(row);
			tbody.appendChild(row);
			row.classList += `${station} ${altLog ? "alt" : ""}`;
			row.classList += `${cI===0 ? " new-station-line" : ""}`;
			row.classList += `${this._options.transparentBackground 
				? " transparent" : ""}`;
		}

		if( !(this._options.suppressStationCallsign ?? false)) {
			const stationCell = document.createElement("td");
			stationCell.textContent = station.toString();
			stationCell.rowSpan = rowCount;

			rowList[0]!.appendChild(stationCell);
		}

		const cellCount = (columnCount * rowCount) - rowCount;
		for (let cI = 0; cI < cellCount; cI++) {

			let qso, cssClass;
			const cell = document.createElement("td");
			
			if (qso = qsoList[cI]) {

				switch( qso.type ){
					case QSOType.Heard:
						cssClass = "heard";
						break;
					case QSOType.Tried:
						cssClass = "tried";
						break;
					case QSOType.Worked:
						cssClass = "worked";
						break;
				}

				const bandDot = document.createElement("span");
				bandDot.textContent = "⬤";
				bandDot.className = `band-${qso.band}`;
			
				const callTxt = document.createElement("span")
				callTxt.className = `${cssClass}`;
				callTxt.textContent = qso.callsign.root;
				
				cell.className = `report`;
				cell.title = `${cssClass} on ${qso.band} m`;

				cell.appendChild(bandDot);
				cell.appendChild(callTxt);
			}

			const rowIndex = (cI % rowCount + rowCount) % rowCount;
			rowList[rowIndex]!.appendChild(cell);
		}

	}

	private getStyle() {

		const out = `

			.report-table {
				font-family: Verdana, Arial, 'Segoe UI Symbol', sans-serif;
				border-spacing: 0;
				font-size: 0.8em;
			}
			
			.report-table tr {
				background-color: #fdfdfd;

				&.new-station-line td {
					border-top: 5px solid #fff;	
				}

				&.alt {
					background-color: #f8f8f8;
				}
					
				&.transparent {
					background-color: transparent;
					
					td {
						border-top: 5px solid transparent;
					}
				}

			}
			
			.report-table td {
				padding: 3px;
				white-space: nowrap;
				vertical-align: top;
			}

			.report-table th {
				border: 1px solid #eee;
				background-color: #fdfdfd;
				white-space: nowrap;
				font-weight: normal;
			}

			.report-table th .worked {
				font-weight: bold;
				font-size: 1.2em;
			}

			.report-table th .tried {
				font-style: italic;
				font-size: 1.2em;
			}

			.report-table th .heard {
				font-size: 1.2em;
			}
			
			.report-table .worked {
				font-weight: bold;
			}

			.report-table .tried {
				font-style: italic;
			}

			.report-table span.band-160 {
				color: #f2cc8f;
			}
				
			.report-table span.band-80 {
				color: #81b29a;
			}
				
			.report-table span.band-40 {
				color: #3d405b;
			}
				
			.report-table span.band-30 {
				color: #e07a5f;
			}
				
			.report-table span.band-20 {
				color: #fb5607;
			}
				
			.report-table {
				span.band-17, span.band-15, span.band-12, span.band-10, span.band-6,  {
					color: #f4f1de;
				}
			}
		`;

		return out;
	}

}

export interface ILogTableBuilderOptions {
	suppressTitle?: boolean;
	suppressStationCallsign?: boolean;
	transparentBackground?: boolean;

}