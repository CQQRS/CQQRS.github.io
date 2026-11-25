import { environment } from "@site/environment/environment";
import { Edition } from "@site/src/classes/Edition";
import { ArgumentError, DataAccessError } from "@site/src/classes/Errors";
import { SubmitStatus } from "@site/src/classes/SubmitStatus";

import Admonition from '@theme/Admonition';
import root from 'react-shadow';

import CodeBlock from '@theme/CodeBlock';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useEffect, useState } from "react";
import { ReportBuilder } from "../classes/ReportBuilder";

export default function ReportGenerator() {

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
			else {
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
				<BrowserOnly>
					{() => <CodeBlock language="text" title="Table" showLineNumbers>{reverseLog}</CodeBlock>}
				</BrowserOnly>
			</div>
			<div style={codeStyle}>
				<BrowserOnly>
					{() => <CodeBlock language="text" title="Soapbox" showLineNumbers>{soapbox}</CodeBlock>}
				</BrowserOnly>
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