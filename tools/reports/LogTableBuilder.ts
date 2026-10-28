import { QSO, QSOType } from "./QSO";
import { JSDOM } from "jsdom";
import type { TLog } from "./Types";

export class LogTableBuilder {

	public constructor(private _log: TLog) {
	}

	/*
	* returns a standalone HTML page with the log table embedded
	*/
	
	public buildHtmlPage(): string {

		const table = this.buildHtmlTable();
		return `<!DOCTYPE html><body>${table}</body>`
	}

	/*
	* returns a string containing an html table with the log
	* 
	*/
	public buildHtmlTable(): string {

		const dom = new JSDOM(`<div><table id="report-table"><tbody id="tbody"></tbody></table></div>`);
		const document = dom.window.document;
		const style = document.createElement("style");
		style.textContent = this.getStyle();
		document.head.appendChild(style);

		const bandList = [40, 80, 160, 30, 20, 17, 15, 12, 10, 6];

		let tbody = document.querySelector("tbody")!;

		const header = this.buildHeaderRow(document, 7);
		tbody.appendChild(header);

		this._log.forEach((qsoList, stationCs) => {

			this.qsoListToTable(document, tbody, qsoList, stationCs, bandList);
		})

		const html = document.documentElement.outerHTML;
		
		return html;
	};

	private buildHeaderRow(doc: HTMLDocument, columnCount: number) {

		const stationCell = doc.createElement("th");
		stationCell.textContent = "Station";

		const titleCell = doc.createElement("th");
		titleCell.textContent = "Where was I heard?"
		titleCell.colSpan = columnCount - 1;

		const rowEl = doc.createElement("tr");
		rowEl.appendChild(stationCell);
		rowEl.appendChild(titleCell);

		return rowEl;

	}

	private qsoListToTable(document: HTMLDocument, tbody: HTMLElement,
		qsoList: QSO[], station: string, bandList: number[]) {

		const columnCount = 7;

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
				cssClass = qso.type == QSOType.Heard
					? "heard"
					: "worked";

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

			#report-table .tried {
				font-style: italic;
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

}