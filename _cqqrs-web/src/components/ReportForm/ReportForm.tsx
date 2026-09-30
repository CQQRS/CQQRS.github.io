import React, { useEffect, useState } from 'react';
import styles from './ReportForm.module.css';
import '@site/src/classes/DateExt';
import { resizeImageFile } from '@site/src/classes/PhotoUtilities';
import { getCurrentEdition } from '@site/src/classes/EditionTools';

type BandHeardWorkedBlockProps = {
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

function BandHeardWorkedBlock({
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

interface PhotoInputBlockProps {
	onChange: (imageFile: File | undefined) => void;
}

function PhotoInputBlock({
	onChange
}: PhotoInputBlockProps) {
	const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
	const [isPhotoDragActive, setIsPhotoDragActive] = useState(false);

	useEffect(() => {
		return () => {
			if (photoPreview?.startsWith('blob:')) {
				URL.revokeObjectURL(photoPreview);
			}
		};
	}, [photoPreview]);

	const handlePhotoFile = (file: File | undefined) => {
		if (photoPreview?.startsWith('blob:')) {
			URL.revokeObjectURL(photoPreview);
		}

		let photoUrl;
		if (file && file.type.startsWith('image/')) {
			photoUrl = URL.createObjectURL(file);
		}

		setPhotoPreview(photoUrl);
		onChange(file);
	};

	const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		handlePhotoFile(file);
		event.target.value = '';
	};

	const handlePhotoDrop = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsPhotoDragActive(false);
		const file = event.dataTransfer.files?.[0];
		handlePhotoFile(file);
	};

	const handlePhotoDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsPhotoDragActive(true);
	};

	const handlePhotoDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsPhotoDragActive(false);
	};

	function mimeToExt(mime: string): string {
		switch (mime) {
			case "image/png": return "png";
			case "image/jpeg": return "jpg";
			case "image/webp": return "webp";
			case "image/gif": return "gif";
			case "image/svg+xml": return "svg";
			case "application/json": return "json";
			default: return "bin";
		}
	}

	return <label
		className={`${styles.photoUpload} ${isPhotoDragActive ? styles.photoUploadActive : ''}`}
		htmlFor="photo-upload"
		onDragOver={handlePhotoDragOver}
		onDragLeave={handlePhotoDragLeave}
		onDrop={handlePhotoDrop}
	>
		<input
			id="photo-upload"
			type="file"
			accept="image/*"
			onChange={handlePhotoChange}
			className={styles.photoInput}
		/>
		{photoPreview ? (
			<div className={styles.photoPreviewWrapper}>
				<img src={photoPreview} alt="Selected report photo" className={styles.photoPreview} />
				<span className={styles.photoFilename}>Choose a different photo</span>
			</div>
		) : (
			<span>Drop your photo here, or click to select a file.</span>
		)}
	</label>
}


interface ReportFormBuilderProps {
	photo: File | undefined
}
export default function ReportFormBuilder({ }: ReportFormBuilderProps) {
	
	const [edition, setEdition] = useState(getCurrentEdition());

	const formFields = ["name", "callsign", "qth", "grid", "heard40", 
		"worked40", "tried40", "heard80", "worked80", "tried80", "heardOther", 
		"workedOther", "triedOther", "comments", "caption"];

	const [formState, setFormState] = useState<Map<string,string>>(() => {
		const map = new Map<string, string>();
		formFields.forEach(field => map.set(field, ''));
		return map;
	});

	const [photo, setPhoto] = useState<File|undefined>(undefined);


	const setFormVal = (key: string, value: string) => {
		setFormState( prev => {

			const copy = new Map(prev);
			copy.set(key, value);
			return copy;

		});
	};
	
	const populateFormFromSearchParams = () => {

		const queryParams = new URLSearchParams(window.location.search);

		setFormState(prev => {
			const tmpState = new Map(prev);
			for( const[key, value] of queryParams){
				if( !prev.has(key)) continue;
				tmpState.set(key, value);
			}
			return tmpState;
		});
	};

	const populateFormFromStorage = (edition: string) => {

		const alwaysRestoreKeys = ["name", "callsign", "qth", "grid"];

		const isCurrent = localStorage.getItem("edition") === edition;

		const tmpState = new Map(formState);
		for( const key of formState.keys()){
			if( isCurrent || alwaysRestoreKeys.includes(key)){
				tmpState.set(key, localStorage.getItem(key) ?? "");
			}
		}

		setFormState(tmpState);
		
	};

	const saveResponse = (edition: string) => {

		for( const[key, value] of formState){
			localStorage.setItem(key, value);
		}

		localStorage.setItem("edition", edition);

	};

	const handleSubmit = async () => {
		const missing = [] as string[];
		if (!formState.get("name")!.trim()) missing.push('Name');
		if (!formState.get("callsign")!.trim()) missing.push('Callsign');
		if (!formState.get("qth")!.trim()) missing.push('QTH');

		if (missing.length > 0) {
			alert(`Please complete the required fields: ${missing.join(', ')}`);
			return;
		}

		saveResponse(edition);

		const formData = new FormData();
		for( const [key, value] of formState) {
			formData.append(key, value);
		}

		const photoToUpload = photo !== undefined ? await resizeImageFile(photo, 1024) : undefined;
		if (photoToUpload !== undefined) {
			const ext = photoToUpload.name.split('.').pop();
			const safeCallsign = formState.get("callsign")!.trim() || 'photo';
			formData.append("file", photoToUpload, `${safeCallsign}_${edition}.${ext}`);
		}

		const url = `https://conryclan.com/projects/cqqrsnet/api/report.php`;
		try{
			return;
			const response = await fetch(url, {method: "POST", body: formData});
			const payload = await response.json().catch(() => null);

			if (!response.ok) {
				const message = payload?.message ?? 'Submission failed.';
				alert(message);
				return;
			}

		}
		catch(ex) {
			console.warn(ex);
			alert('There was a problem submitting the report.');
		}

	}	

	const rptPlaceholder = "40 m\n...\n\n80 m\n...\n\n?? m\n...";

	useEffect(() => { 
		populateFormFromStorage(edition);
		populateFormFromSearchParams(); 
	}, []);

	return (
		<div
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
							required
							value={formState.get("name")}
							onChange={(e) => setFormVal("name", e.target.value)}
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
							required
							value={formState.get("callsign")}
							onChange={(e) => setFormVal("callsign", e.target.value)}
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
							required
							value={formState.get("qth")}
							onChange={(e) => setFormVal("qth", e.target.value)}
							className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.input}`}
							placeholder="Enter your location"
						/>
					</div>

					<div className={styles.fieldGroup} style={{ display: "none"}}>
						<label htmlFor="grid" className="mb-1 block text-sm font-medium text-slate-700">
							Maidenhead Gridsquare (Find it using <a href="https://whatsmylocator.co.uk/">What's My Locator</a>)
						</label>
						<input
							id="grid"
							type="text"
							value={formState.get("grid")}
							onChange={(e) => setFormVal("grid", e.target.value)}
							className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.input}`}
							placeholder="4 or 6 digit maidenhead grid"
						/>
					</div>

				</section>
			</div>

			<section className={`mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 ${styles.bandSection}`}>
				<h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Stations Worked/Heard</h3>
				Enter the callsigns you worked, heard or tried, separating each with a comma.
				Leave blank if none.
				<br />
				eg. VK1AA, VK2BB, VK3CC

				<div className="grid gap-4 md:grid-cols-2">

					<BandHeardWorkedBlock
						band="40"
						heard={formState.get("heard40") ?? ""}
						worked={formState.get("worked40") ?? ""}
						tried={formState.get("tried40") ?? ""}
						placeholder=""
						explanation=""
						onHeardChange={(val)=> setFormVal("heard40",val)}
						onWorkedChange={(val)=> setFormVal("worked40",val)}
						onTriedChange={(val)=> setFormVal("tried40",val)}
					/>

					<BandHeardWorkedBlock
						band="80"
						heard={formState.get("heard80") ?? ""}
						worked={formState.get("worked80") ?? ""}
						tried={formState.get("tried80") ?? ""}
						placeholder=""
						explanation=""
						onHeardChange={(val)=> setFormVal("heard80",val)}
						onWorkedChange={(val)=> setFormVal("worked80",val)}
						onTriedChange={(val)=> setFormVal("tried80",val)}
					/>

					<BandHeardWorkedBlock
						band="Other"
						heard={formState.get("heardOther") ?? ""}
						worked={formState.get("workedOther") ?? ""}
						tried={formState.get("triedOther") ?? ""}
						placeholder=""
						explanation="For other bands, append each callsign with '@' and the band.  Eg. VK4DD@20, VK5EE@20, VK6FF@160"
						onHeardChange={(val)=> setFormVal("heardOther",val)}
						onWorkedChange={(val)=> setFormVal("workedOther",val)}
						onTriedChange={(val)=> setFormVal("triedOther",val)}
					/>
				</div>
			</section>

			<section>
				<h3>General Comments</h3>
				<div className="mt-6">
					Any thoughts about the evening you'd like to share?  
					Conditions, special QSOs, funny things you heard or that 
					happened?  This is what makes the reports so interesting to 
					RagChew readers.
					<textarea
						id="comments"
						value={formState.get("comments") ?? ""}
						onChange={(e) => setFormVal("comments", e.target.value)}
						rows={8}
						className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.textarea}`}
						placeholder={rptPlaceholder}
					/>
				</div>
			</section>

			<section>
				<h3>Share a photo</h3>
				<div className="mt-6">
					Why not share a photo of your operating position, radio, antenna or anything else readers may find interesting.
					<PhotoInputBlock
						onChange={setPhoto}
					/>
					<div className={styles.fieldGroup}>
						<label htmlFor="caption" className="mb-1 block text-sm font-medium text-slate-700">
							Caption
						</label>
						<input
							id="caption"
							type="text"
							required
							value={formState.get("caption") ?? ""}
							onChange={(e) => setFormVal("caption", e.target.value)}
							className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${styles.input}`}
							placeholder="Caption to accompany your photo"
						/>
					</div>
				</div>
			</section>

			<div className={`mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between ${styles.header}`}>
				<button
					className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					onClick={handleSubmit}
				>
					Save report
				</button>
			</div>

		</div>
	);
}
