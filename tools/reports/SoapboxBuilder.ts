import { JSDOM } from "jsdom";
import juice from "juice";

import { Report } from "./Report";
import { environment } from "./environment";

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
				&& v.photoFilename.length == 0
			) return;

			const rows = this.buildReportHtml(v);
			rows.map(row => {
				const rowEl = document.createElement("tr");
				rowEl.innerHTML = row;
				tbody.appendChild(rowEl);
			});
		});

		const html = document.documentElement.outerHTML;
		
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
				<img src="${environment.resourceApiRoot}/avitar/${report.callsign}_1.jpg" />
			</td>
			<td class="operator">
				<div class="name">${report.name} ${report.callsign}</div>
				<div class="qth">${report.qth}</div>
			<td>
			`
		];

		if( report.comments !== ""){
			const comment = report.comments
				.replace(/\r?\n/g, "<br>")

			rowList.push(`<td colspan="2" class="comment">${comment}</td>`)
		}

		if( report.photoFilename !== "") {
			
			const photoList = Array.isArray(report.photoFilename)
				? report.photoFilename
				: [report.photoFilename];

			let rowHtml = `<td colspan="2" class="photo">`;

			photoList.map(photo => {
				const src = `${environment.reportApiRoot}/${report.edition}/images/${photo}`
				rowHtml += `
						<a href="${src}" target="_new">	
							<img src="${src}" class="share-${photoList.length}"/>
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
				width: 50px;
			}

			#soapbox-root .avitar img {
				object-fit: cover;
				height: 50px;
				width: 50px;
				border-radius: 50%;
			}

			#soapbox-root .comment, #soapbox-root .photo {
				padding: 15px;
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
				size: 14px;
				font-style: italic;
			}

			#soapbox-root .foot {
				padding: 20px 80px 10px 80px;
			}
			
		`;

		return out;
	}

}