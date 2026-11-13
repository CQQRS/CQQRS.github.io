import { JSDOM } from "jsdom";
import juice from "juice";

import { Report } from "./Report";
import { environment } from "./environment";
import { LogTableBuilder, type ILogTableBuilderOptions } from "./LogTableBuilder";
import { LogCollection } from "./LogCollection";

export class SoapboxBuilder {

	constructor(private _reportList: Report[]) {
	}

	buildHtmlPage(): string {
		const html = this.buildHtml();
		return `<!DOCTYPE html><head><meta charset="UTF-8"></head><body>${html}</body>`
	}

	buildHtml(): string {

		const dom = new JSDOM(`<div id="soapbox-root"><table id="soapbox-table"><tbody id="tbody"></tbody></table></div>`);
		const document = dom.window.document;
		const style = document.createElement("style");
		style.textContent = this.getStyle();
		const contentRoot = document.querySelector("#soapbox-root")!;
		contentRoot.appendChild(style);
		let tbody = document.querySelector("tbody")!;

		this._reportList.map(v => {
			
			if( v.comments.length == 0 
				&& v.photos.length == 0
			) return;

			const rows = this.buildReportHtml(v);
			rows.map(row => {
				const rowEl = document.createElement("tr");
				rowEl.innerHTML = row;
				tbody.appendChild(rowEl);
			});
		});

		const html = contentRoot.outerHTML;
		
		const juiceOptions: juice.Options = {
			removeStyleTags: true,
			applyHeightAttributes: true,
			applyWidthAttributes: true,
			applyAttributesTableElements: true,

		}
		const inlined = juice(html, juiceOptions);

		return inlined;
	}

	buildReportHtml(report: Report): string[] {

		const rowList = [
			`
			<td class="avitar">
				<img src="${environment.resourceApiRoot}/avitar/${report.callsign.root}_1.jpg" />
			</td>
			<td class="operator">
				<div class="name">${report.name} ${report.callsign}</div>
				<div class="qth">${report.qth}</div>
			<td>
			`
		];

		if( report.qsoList.length > 0){
			
			const log = new LogCollection();
			log.getOrInsert(report.callsign, report.qsoList);
			const options: ILogTableBuilderOptions = {
				suppressStationCallsign: true,
				suppressTitle: true,
				transparentBackground: true
			}

			const logHtml = new LogTableBuilder(log, options).buildHtml();

			rowList.push(
				`<td colspan="2" class="log">
					<table><tr>
						<td class="log-title">Station Log:</td>
						<td>${logHtml}</td>
					</tr></table>
				</td>`);
		}

		

		if( report.comments !== ""){
			const comment = report.comments
				.replace(/\r?\n/g, "<br>")

			rowList.push(`<td colspan="2" class="comment">${comment}</td>`)
		}

		if( report.photos.length > 0) {
			
			const photoList = report.photos;

			let rowHtml = `<td colspan="2" class="photo">`;

			photoList.map(photo => {
				const srcDir = `${environment.reportApiRoot}/${report.edition}/images/`
				const thumb = photo.filename.replace(".", "_400.")
				rowHtml += `
						<a href="${srcDir}${photo.filename}" target="_new">	
							<img src="${srcDir}${thumb}" class="share-${photoList.length}"/>
						</a>
				`;
			});

			rowHtml += `<td colspan="2" class="photo">`

			rowList.push(rowHtml);
			
		}
	

		if( report.caption !== "" ) {
			rowList.push(`<td colspan="2" class="caption">${report.caption}</td>`);
		}

		rowList.push(`<td colspan="2" class="foot"><hr /></td>`);

		return rowList;

	}

	private getStyle() {

		const out = `

			#soapbox-root {
				font-size: 16px;
				font-family: "Helvetica Neue", Helvetica, Arial, Verdana, sans-serif;
			}	

			#soapbox-root .name, #soapbox-root .qth {
				padding-left: 15px;
			}
			

			#soapbox-root .name {
				font-weight: bold;
				size: 18px;
			}	
		
			#soapbox-root .qth {
				size: 16px;
				color: #444
			}

			#soapbox-root .avitar {
				width: 60px;
				padding-left: 15px;
			}

			#soapbox-root .avitar img {
				object-fit: cover;
				height: 60px;
				width: 60px;
				border-radius: 50%;
			}

			#soapbox-root .comment {
				line-height: 1.5em;
			}

			#soapbox-root .log,
			#soapbox-root .comment, 
			#soapbox-root .photo {
				padding: 5px 15px 5px 15px;
			}

			#soapbox-root .log .log-title {
				padding-top: 8px;
				vertical-align: top;
			}

			#soapbox-root .photo, #soapbox-root .caption {
				text-align: center;
			}
			
			#soapbox-root .photo img {
				max-height: 300px;
				border-radius: 5px;
			}

			#soapbox-root .photo img.share-2 {
				max-width: 45%;
			}

			#soapbox-root .photo img.share-3 {
				max-width: 30%;
			}

			#soapbox-root .photo img.share-4 {
				max-width: 22%;
			}

			#soapbox-root .caption {
				font-size: 0.9em;
				font-style: italic;
			}

			#soapbox-root .foot {
				padding: 20px 80px 10px 80px;
			}
			
		`;

		return out;
	}

}