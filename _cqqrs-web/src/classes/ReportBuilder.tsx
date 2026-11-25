import { Edition } from "@site/src/classes/Edition";
import { Report } from "@site/src/classes/Report";
import { LogCollection } from "@site/src/classes/LogCollection";
import { LogTableBuilder } from "@site/src/classes/LogTableBuilder";
import { loadMemberDirectory } from "@site/src/classes/MemberDirectory";
import { ReverseLog } from "@site/src/classes/ReverseLog";
import { SoapboxBuilder } from "@site/src/classes/SoapboxBuilder";
import { CqqrsApiClient, HttpError } from "@site/src/classes/ApiClient/CqqrsApiClient";
import { DataAccessError } from "@site/src/classes/Errors";

export class ReportBuilder {

	private _edition: Edition;

	private _extraCs: string = "";
	public addExtraContributors(contrib: string) {
		this._extraCs = contrib;
	}

	public soapbox: string = "Soapbox not yet built.";
	public reverseLog: string = "Reverse log not yet built.";
	public contributors: string = "Contributor list not yet built."
	public summary: string = "Summary not yet built."

	constructor(edition: string) {
		this._edition = new Edition(edition);
	}

	public async build(): Promise<ReportBuilder> {

		const api = new CqqrsApiClient();

		let reportList: Report[] = [];
		try {
			reportList = await api.reports.getAll(this._edition.year, this._edition.week);
		}
		catch (e) {
			if (e instanceof HttpError) {
				if (e.status == 404) {
					throw new DataAccessError(
						"No reports were found for this edition.");
				}
				else {
					throw new Error(`Could not download report.  ${e.message} (${e.status})`);
				}
			}

			throw new Error(`Error downloading report.\n${JSON.stringify(e)}`);
		}

		const log = new LogCollection();
		reportList.map(v => log.getOrInsert(v.callsign, v.qsoList));

		this.soapbox = new SoapboxBuilder(reportList).buildHtml();

		const reverseLog = new ReverseLog(log).toLogCollection();
		const memberDirectory = await loadMemberDirectory();
		let filteredReverseLog = reverseLog.filter(v =>
			memberDirectory.has(v.callsign.root));

		//Sort by station CS
		filteredReverseLog.sortByStationsLogCallsign();

		this.reverseLog = new LogTableBuilder(filteredReverseLog).buildHtml();

		this.summary = `${log.size} reports were received, showing `
			+ `${filteredReverseLog.size} CQQRS members who worked and heard `
			+ `${reverseLog.size} stations!`;

		this.contributors = this.getContributors(reportList);
		return this;
	}

	private getContributors(reportList: Report[]) {
		let contribList: string[] = reportList.map(v => v.callsign.root);
		console.log(contribList.join(", "));
		contribList.push(...this._extraCs.split(/[ ,&]/));

		console.log(contribList.join(", "));
		contribList = contribList.filter(v => v.trim().length > 0);
		contribList = contribList.map(v => v.toUpperCase());
		contribList.sort();
		console.log(contribList.join(", "));
		contribList = [...new Set(contribList)]; // make unique

		console.log(contribList.join(", "));

		const formatter = new Intl.ListFormat("en", {
			style: "long",
			type: "conjunction",
		});

		var contribText = formatter.format(contribList);

		console.log(contribList.join(", "));
		return `${contribList.length} Contributors: ${contribText}`;
	}

	public formatOutputStrings(input: string): (string | React.JSX.Element)[] {
		const parts = input.split(/(\d+)/g);
		const jsxResult = parts.map((part, index) =>
			/^\d+$/.test(part) ? <b key={index}>{part}</b> : part
		);

		return jsxResult;


	}
}