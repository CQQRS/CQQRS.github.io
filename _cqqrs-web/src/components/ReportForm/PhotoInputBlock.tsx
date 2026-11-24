import React, { useEffect, useState } from 'react';
import styles from './ReportForm.module.css';

interface PhotoInputBlockProps {
	onChange: (imageFiles: File[]) => void;
	maxPhotos?: number;
}

export function PhotoInputBlock({
	onChange,
	maxPhotos = 1
}: PhotoInputBlockProps) {
	const [photoPreviews, setPhotoPreviews] = useState<Array<{ url: string; name: string; file: File }>>([]);
	const [isPhotoDragActive, setIsPhotoDragActive] = useState(false);

	useEffect(() => {
		return () => {
			photoPreviews.forEach(({ url }) => {
				if (url.startsWith('blob:')) {
					URL.revokeObjectURL(url);
				}
			});
		};
	}, [photoPreviews]);

	const handlePhotoFiles = (files: FileList | File[] | undefined) => {
		const validFiles = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));

		setPhotoPreviews((previousPreviews) => {
			// Calculate how many new photos can be added
			const availableSlots = maxPhotos - previousPreviews.length;
			const photosToAdd = validFiles.slice(0, availableSlots);

			// Create previews for new photos
			const newPreviews = photosToAdd.map((file) => ({
				url: URL.createObjectURL(file),
				name: file.name,
				file,
			}));

			// Combine previous and new previews
			const updated = [...previousPreviews, ...newPreviews];

			// Pass the actual files to parent
			onChange(updated.map((preview) => preview.file));

			return updated;
		});
	};

	const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		handlePhotoFiles(event.target.files ?? undefined);
		event.target.value = '';
	};

	const handlePhotoDrop = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsPhotoDragActive(false);
		handlePhotoFiles(event.dataTransfer.files);
	};

	const handlePhotoDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsPhotoDragActive(true);
	};

	const handlePhotoDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsPhotoDragActive(false);
	};

	const removePhoto = (indexToRemove: number) => {
		setPhotoPreviews((previousPreviews) => {
			const photoToRemove = previousPreviews[indexToRemove];
			if (photoToRemove.url.startsWith('blob:')) {
				URL.revokeObjectURL(photoToRemove.url);
			}

			const updated = previousPreviews.filter((_, index) => index !== indexToRemove);
			onChange(updated.map((preview) => preview.file));

			return updated;
		});
	};

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
			multiple
			onChange={handlePhotoChange}
			className={styles.photoInput}
		/>
		{photoPreviews.length > 0 ? (
			<div className={styles.photoPreviewWrapper}>
				<div className="flex flex-wrap gap-2">
					{photoPreviews.map((preview, index) => (
						<div key={preview.url} className={styles.photoPreviewContainer}>
							<img
								src={preview.url}
								alt={`Selected report photo ${index + 1}`}
								className={styles.photoPreview}
							/>
							<button
								type="button"
								onClick={() => removePhoto(index)}
								className={styles.photoCloseButton}
								title="Remove photo"
								aria-label={`Remove photo ${index + 1}`}
							>
								✕
							</button>
						</div>
					))}
				</div>
				{maxPhotos > 1 &&
				<span className={styles.photoFilename}>
					{photoPreviews.length === 1
						? `1 photo selected (${maxPhotos - 1} more allowed)`
						: `${photoPreviews.length} photos selected${photoPreviews.length < maxPhotos ? ` (${maxPhotos - photoPreviews.length} more allowed)` : ' (max reached)'}`
					}
				</span>
				}
				{photoPreviews.length < maxPhotos && (
					<span className="text-sm text-slate-500">
						Drag more photos here, or click to add more.
					</span>
				)}
			</div>
		) : (
			<span>
				{maxPhotos > 1
					? `Drop your photos here (up to ${maxPhotos}), or click to select files.`
					: "Drop your photo here, or click to select files."
				}
			</span>
		)}
	</label>
}