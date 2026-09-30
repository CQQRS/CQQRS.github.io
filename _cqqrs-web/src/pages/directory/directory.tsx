import { useState } from "react";

import styles from './directory.module.css';

interface ReportFormBuilderProps {
	photo: File | undefined
}
export default function ReportFormBuilder({ }: ReportFormBuilderProps) {
	

	
		

	return (
		<div
			className={`mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${styles.reportForm}`}
		>
		</div>
	);
}
