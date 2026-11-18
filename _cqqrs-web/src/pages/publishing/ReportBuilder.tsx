import { environment } from "@site/environment/environment";
import { ApiReportToReportConvertor } from "@site/src/classes/ApiReportToReportConvertor";
import { Edition } from "@site/src/classes/Edition";
import { Report } from "@site/src/classes/Report";
import { IApiReport } from "@site/src/classes/IApiReport";
import { LogCollection } from "@site/src/classes/LogCollection";
import { LogTableBuilder } from "@site/src/classes/LogTableBuilder";
import { loadMemberDirectory } from "@site/src/classes/MemberDirectory";
import { ReverseLog } from "@site/src/classes/ReverseLog";
import { SoapboxBuilder } from "@site/src/classes/SoapboxBuilder";


import Admonition from '@theme/Admonition';
import root from 'react-shadow';

class ReportBuilder {

	private _edition: Edition;
	
	private _extraCs: string = "";
	public addExtraContributors(contrib: string){
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

		const url = `${environment.cqqApiRoot}/reports/${this._edition.year}/` +
			`${this._edition.week}`;

		const response = await fetch(url, {cache: "no-cache"});
		if (!response.ok) {
			
			if (response.status == 404) {
				throw new DataAccessError("No reports were found for this edition.")
			}
			
			throw new Error(`Could not download report.  ${response.statusText} (${response.status})`);
		}

		const data = await response.json() as IApiReport[];
		const reportList = data.map(v => new ApiReportToReportConvertor(v).report)
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
		contribList.push( ...this._extraCs.split(/[ ,&]/));

		console.log(contribList.join(", "));
		contribList = contribList.filter(v => v.trim().length > 0);
		contribList = contribList.map(v=> v.toUpperCase());
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

import CodeBlock from '@theme/CodeBlock';
import { useEffect, useState } from "react";
import { ArgumentError, DataAccessError } from "@site/src/classes/Errors";
import { SubmitStatus } from "@site/src/classes/SubmitStatus";

export default function TableCode() {

	const [reverseLog, setReverseLog] = useState("...");
	const [soapbox, setSoapbox] = useState("...");
	const [summary, setSummary] = useState<Array<string | React.JSX.Element>>([
		"..."
	]);
	const [contributors, setContributors] = useState("...");
	const [edition, setEdition] = useState("");
	const [extraCs, setExtraCs] = useState(environment.ragchewContributingEditors);
	const [errorMsg, setErrorMsg] = useState("");
	const [submitStatus, setSubmitStatus] = useState(SubmitStatus.Idle);

	
	useEffect(() => {
		const edition = new Edition();
		setEdition(edition.toString());
	}, []);

	const run = async () => {
		
		setErrorMsg("");

		let rb: ReportBuilder;

		try {
			const edn = new Edition(edition);
			rb = new ReportBuilder(edn.toString());
			rb.addExtraContributors(extraCs);
			await rb.build();
		}
		catch (err) {
			setSubmitStatus(SubmitStatus.Error);
			if (err instanceof DataAccessError) {
				setErrorMsg(err.message);
			}
			else if (err instanceof DataAccessError) {
				setErrorMsg("Unable to gerate the reports: " + err.message);
			}
			else if (err instanceof ArgumentError) {
				setErrorMsg("Invalid argument: " + err.message);
			}
			else{
				setErrorMsg("Unknown error: " + err)
			}

			return;
		}
		setReverseLog(rb.reverseLog);
		setSoapbox(rb.soapbox);
		setSummary(rb.formatOutputStrings(rb.summary));
		setContributors(rb.contributors);

		setSubmitStatus(SubmitStatus.Success);
	};

	const handleEditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEdition(e.target.value ?? "");
	};

	const addCallsignsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			setExtraCs(e.target.value ?? "");
		} catch {
		}
	}

	const handleGoClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
		setSubmitStatus(SubmitStatus.Submitting);
		try {
			run();
		} catch (ex: any) {
			console.error(ex.message);
		}
	};

	// Styles leveraging official Infima/Docusaurus tokens
	const labelStyle = {
		display: 'inline',
		fontWeight: 'var(--ifm-font-weight-bold)' as const,
		margin: '6px',
		fontSize: '0.9rem',
		color: 'var(--ifm-color-emphasis-700)',
	};

	const inputStyle = {
		width: '100%',
		padding: '8px 12px',
		fontSize: 'var(--ifm-font-size-base)',
		fontFamily: 'var(--ifm-font-family-base)',
		backgroundColor: 'var(--ifm-background-color)',
		color: 'var(--ifm-font-color-base)',
		border: '1px solid var(--ifm-color-emphasis-300)',
		borderRadius: 'var(--ifm-global-radius)',
		outline: 'none',
		boxSizing: 'border-box' as const,
		transition: 'border-color var(--ifm-transition-fast)',
	};

	const buttonStyle = {
		display: 'inline-block',
		padding: '8px 16px',
		margin: '10px',
		fontSize: 'var(--ifm-font-size-base)',
		fontFamily: 'var(--ifm-font-family-base)',
		fontWeight: 'var(--ifm-font-weight-bold)' as const,
		// Uses your site's exact primary accent color:
		backgroundColor: 'var(--ifm-color-primary)',
		color: '#fff', // White text generally provides best contrast on primary branding
		border: 'none',
		borderRadius: 'var(--ifm-global-radius)',
		cursor: 'pointer',
		transition: 'background-color var(--ifm-transition-fast), transform 0.1s ease',
	};

	const errorStyle = {

	}

	const codeStyle = {
		maxHeight: "20em",
		overflow: "scroll",
		margin: "20px"
	};

	const reportTextStyle = {
		margin: "20px"
	};


	return (
		<div className="markdown">
			<label style={labelStyle}>Additional contributors</label>
			<div>
				<input style={inputStyle}
					value={extraCs}
					onChange={addCallsignsChange}
				></input>
			</div>
			<div>
				<input type="text"
					style={{ ...inputStyle, width: '110px' }}
					placeholder="eg. 2026/44"
					onChange={handleEditionChange}
					value={edition.toString()}
				></input>
				<button type="button"
					style={buttonStyle}
					onClick={handleGoClick}
					disabled={submitStatus === SubmitStatus.Submitting}
				>
					{submitStatus === SubmitStatus.Idle && "Submit"}
					{submitStatus === SubmitStatus.Submitting && "Submitting…"}
					{submitStatus === SubmitStatus.Success && "Done!"}
					{submitStatus === SubmitStatus.Error && "Oh oh!"}
				</button>
			</div>
			{errorMsg.length > 1 && (
				<Admonition type="warning" title="Whoops!">
					<p>{errorMsg}</p>
				</Admonition>
			)}

			<hr></hr>

			<label style={labelStyle}>Summery</label>
			<div style={reportTextStyle}>{summary}</div>

			<label style={labelStyle}>Contributors</label>
			<div style={reportTextStyle}>{contributors}</div>
			<div style={codeStyle}>
				<CodeBlock
					language="text"
					title="Table"
					showLineNumbers
				>
					{reverseLog}
				</CodeBlock>
			</div>
			<div style={codeStyle}>
				<CodeBlock
					language="text"
					title="Soapbox"
					showLineNumbers>
					{soapbox}
				</CodeBlock>
			</div>

			<hr></hr>
			<h2>Preview: Reverse Log</h2>
			<root.div className="quote">
				<div dangerouslySetInnerHTML={{ __html: reverseLog }} />
			</root.div>

			<h2>Preview: Soapbox</h2>
			<root.div className="quote">
				<div dangerouslySetInnerHTML={{ __html: soapbox }} />
			</root.div>

		</div>

		
	);

}