import { JSDOM } from "jsdom";
import juice from "juice";

import { QSO, QSOType } from "./QSO";
import type { TLog } from "./Types";

export class LogTableBuilder {

	private readonly _columnCount: number = 10

	public constructor(private _log: TLog) {
	}

	/*
	* returns a standalone HTML page with the log table embedded
	*/
	
	public buildHtmlPage(): string {

		const table = this.buildHtml();
		return `<!DOCTYPE html><head><meta charset="UTF-8"></head><body>${table}</body>`
	}

	/*
	* returns a string containing an html table with the log
	* 
	*/
	public buildHtml(): string {

		const dom = new JSDOM(`<div id="logtable-root"><table id="report-table"><tbody id="tbody"></tbody></table></div>`);
		const document = dom.window.document;
		const style = document.createElement("style");
		style.textContent = this.getStyle();
		const contentRoot = document.querySelector("#content-root")!;
		contentRoot.appendChild(style);

		const bandList = [40, 80, 160, 30, 20, 17, 15, 12, 10, 6];

		let tbody = document.querySelector("tbody")!;

		const header = this.buildHeaderRow(document);
		tbody.appendChild(header);

		this._log.forEach((qsoList, stationCs) => {

			this.qsoListToTable(document, tbody, qsoList, stationCs, bandList);
		})

		const html = document.documentElement.outerHTML;
		
		const inlined = juice(html, {removeStyleTags: true});
		
		return inlined;
	};

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
			?`;

		titleCell.innerHTML = `${title}`;
		titleCell.colSpan = this._columnCount - 1;

		const rowEl = doc.createElement("tr");
		rowEl.appendChild(stationCell);
		rowEl.appendChild(titleCell);

		return rowEl;

	}

	private qsoListToTable(document: HTMLDocument, tbody: HTMLElement,
		qsoList: QSO[], station: string, bandList: number[]) {

		const columnCount = this._columnCount;

		const rowCount = Math.floor(qsoList.length / columnCount) + 1;

		const rowList: HTMLTableRowElement[] = [];
		for (let cI = 0; cI < rowCount; cI++) {
			const row = document.createElement("tr");
			rowList.push(row);
			tbody.appendChild(row);

			if (cI == 0) {
				row.classList += "new-station";
			}
		}

		const stationCell = document.createElement("td");
		stationCell.textContent = station;
		stationCell.rowSpan = rowCount;

		rowList[0]!.appendChild(stationCell);

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

				cell.textContent = qso.callsign;
				cell.className = `report band-${qso.band} ${cssClass}`;
				cell.title = `${cssClass} on ${qso.band} m`;
			}

			const rowIndex = (cI % rowCount + rowCount) % rowCount;
			rowList[rowIndex]!.appendChild(cell);
		}

	}

	private getStyle() {

		const out = `

			#report-table {
				//border-collapse: collapse;
				//border: 1px solid #ccc;
				font-family: Verdana, Arial;
				font-family: Verdana, Arial, 'Segoe UI Symbol', sans-serif;
				border-spacing: 6px;
				font-size: 0.8em;
			}

			#report-table tr.new-station {
			
			}
			
			#report-table td, #report-table th {
				border: 1px solid #eee;
				background-color: #fdfdfd;
				margin: 6px;
				white-space: nowrap;
			}

			#report-table th {
				font-weight: normal;

			}

			#report-table th .worked {
				font-weight: bold;
				font-size: 1.2em;
			}

			#report-table th .tried {
				font-style: italic;
				font-size: 1.2em;
			}

			#report-table th .heard {
				font-size: 1.2em;
			}

			

			#report-table .report {
				border-left: 10px solid #fff;
				border-radius: 5px 0 0 5px;
			}
			
			#report-table .worked {
				font-weight: bold;
			}

			#report-table .tried {
				font-style: italic;
			}

			#report-table td.band-160 {
				border-left-color: #f2cc8f;
			}
				
			#report-table span.band-160 {
				color: #f2cc8f;
			}
				
			#report-table td.band-80 {
				border-left-color: #81b29a;
			}
				
			#report-table span.band-80 {
				color: #81b29a;
			}
				
			#report-table td.band-40 {
				border-left-color: #3d405b;
			}
				
			#report-table span.band-40 {
				color: #3d405b;
			}
				
			#report-table td.band-30 {
				border-left-color: #e07a5f;
			}
				
			#report-table span.band-30 {
				color: #e07a5f;
			}
				
			#report-table td.band-20 {
				border-left-color: #fb5607;
			}
				
			#report-table span.band-20 {
				color: #fb5607;
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

}