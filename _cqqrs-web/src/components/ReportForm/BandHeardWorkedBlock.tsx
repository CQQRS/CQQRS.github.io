
import styles from './ReportForm.module.css';

export type BandHeardWorkedBlockProps = {
	band: string;
	heard: string;
	worked: string;
	tried: string;
	placeholder: string;
	explanation: String;
	onHeardChange: (value: string) => void;
	onWorkedChange: (value: string) => void;
	onTriedChange: (value: string) => void;
};

export function BandHeardWorkedBlock({
	band,
	heard,
	worked,
	tried,
	placeholder,
	explanation,
	onHeardChange,
	onWorkedChange,
	onTriedChange,
}: BandHeardWorkedBlockProps) {
	return (
		<div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 md:col-span-2">

			<div className={`${styles.explanation} text-sm text-slate-600`}>
				{explanation}
			</div>
			<div className="space-y-3">
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
					<label htmlFor={`tried-${band}`} className={styles.inlineFieldLabel}>
						Tried {band}
					</label>
					<input
						id={`tried-${band}`}
						type="text"
						min="0"
						value={tried}
						onChange={(e) => onTriedChange(e.target.value)}
						className={`${styles.input} ${styles.inlineFieldInput}`}
						placeholder={placeholder}
					/>
				</div>
			</div>
		</div>
	);
}