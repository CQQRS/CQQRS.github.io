import React, { useState } from 'react';
import styles from './ReportForm.module.css';

interface ReportFormBuilderProps {
	// ftdChanged?: (ftd: ITaskDraft) => void;
}

type OtherBandsProps = {
	band: string;
	heard: string;
	worked: string;
	placeholder: string;
	explanation: String;
	onHeardChange: (value: string) => void;
	onWorkedChange: (value: string) => void;
};

function OtherBandsBlock({
	band,
	heard,
	worked,
	placeholder,
	explanation,
	onHeardChange,
	onWorkedChange,
}: OtherBandsProps) {
	return (
		<div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 md:col-span-2">
			
			
			<div className={`${styles.explanation} text-sm text-slate-600`}>
				{explanation}
			</div>
			<div className="space-y-3">
				<div className={styles.inlineFieldRow}>
					<label htmlFor={`heard-${band}`} className={styles.inlineFieldLabel}>
						Heard {band}
					</label>
					<input
						id={`heard-${band}`}
						type="text"
						min="0"
						value={heard}
						onChange={(e) => onHeardChange(e.target.value)}
						className={`${styles.input} ${styles.inlineFieldInput}`}
						placeholder={placeholder}
					/>
				</div>
				<div className={styles.inlineFieldRow}>
					<label htmlFor={`worked-${band}`} className={styles.inlineFieldLabel}>
						Worked {band}
					</label>
					<input
						id={`worked-${band}`}
						type="text"
						min="0"
						value={worked}
						onChange={(e) => onWorkedChange(e.target.value)}
						className={`${styles.input} ${styles.inlineFieldInput}`}
						placeholder={placeholder}
					/>
				</div>
			</div>
		</div>
	);
}

export default function ReportFormBuilder({ }: ReportFormBuilderProps) {
	const [name, setName] = useState('');
	const [callsign, setCallsign] = useState('');
	const [qth, setQth] = useState('');
	const [grid, setGrid] = useState('');

	const [heard40, setHeard40] = useState('');
	const [worked40, setWorked40] = useState('');
	const [heard80, setHeard80] = useState('');
	const [worked80, setWorked80] = useState('');
	const [heardOther, setHeardOther] = useState('');
	const [workedOther, setWorkedOther] = useState('');

	const [comments, setComments] = useState('');

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={`mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${styles.reportForm}`}
		>
			<div className="grid gap-6 md:grid-cols-2">
				<section className={`space-y-4 rounded-xl bg-slate-50 p-4 ${styles.section}`}>
					<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Operator</h3>

					<div className={styles.fieldGroup}>
						<label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
							Name
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.input}`}
							placeholder="Your name as you would like it to appear in the newsletter"
						/>
					</div>

					<div className={styles.fieldGroup}>
						<label htmlFor="callsign" className="mb-1 block text-sm font-medium text-slate-700">
							Callsign
						</label>
						<input
							id="callsign"
							type="text"
							value={callsign}
							onChange={(e) => setCallsign(e.target.value)}
							className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.input}`}
							placeholder="Or if unlicensed: SWL-Your_Name"
						/>
					</div>

					<div className={styles.fieldGroup}>
						<label htmlFor="qth" className="mb-1 block text-sm font-medium text-slate-700">
							QTH
						</label>
						<input
							id="qth"
							type="text"
							value={qth}
							onChange={(e) => setQth(e.target.value)}
							className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.input}`}
							placeholder="Enter your location"
						/>
					</div>

					<div className={styles.fieldGroup}>
						<label htmlFor="grid" className="mb-1 block text-sm font-medium text-slate-700">
							Maidenhead Gridsquare (Find it using <a href="https://whatsmylocator.co.uk/">What's My Locator</a>)
						</label>
						<input
							id="grid"
							type="text"
							value={grid}
							onChange={(e) => setGrid(e.target.value)}
							className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.input}`}
							placeholder="4 or 6 digit maidenhead grid"
						/>
					</div>
				</section>
			</div>

			<section className={`mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 ${styles.bandSection}`}>
				<h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Stations Worked/Heard</h3>
					Enter the callsigns you worked or heard, separating each with either a comma.  
					Leave blank if none.
					<br />
					eg. VK1AA, VK2BB, VK3CC 

				<div className="grid gap-4 md:grid-cols-2">

					<OtherBandsBlock
						band="40"
						heard={heard40}
						worked={worked40}
						placeholder=""
						explanation=""
						onHeardChange={setHeard40}
						onWorkedChange={setWorked40}
					/>

					<OtherBandsBlock
						band="80"
						heard={heard80}
						worked={worked80}
						placeholder=""
						explanation=""
						onHeardChange={setHeard80}
						onWorkedChange={setWorked80}
					/>
					
					<OtherBandsBlock
						band="Other"
						heard={heardOther}
						worked={workedOther}
						placeholder=""
						explanation="For other bands, append each callsign with '@' and the band.  Eg. VK4DD@20, VK5EE@20, VK6FF@160"
						onHeardChange={setHeardOther}
						onWorkedChange={setWorkedOther}
					/>
				</div>
			</section>

			<section>
				<h3>General Comments</h3>
				<div className="mt-6">
					Any thoughts about the evening you'd like to share?  Conditions, special QSOs, funny things you heard or that happened?  This is what makes the reports so interesting to RagChew readers.
					<textarea
						id="comments"
						value={comments}
						onChange={(e) => setComments(e.target.value)}
						rows={5}
						className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.textarea}`}
						placeholder=""
					/>
				</div>
			</section>
			<div className={`mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between ${styles.header}`}>
				<button
					type="submit"
					className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Save report
				</button>
			</div>

		</form>
	);
}
