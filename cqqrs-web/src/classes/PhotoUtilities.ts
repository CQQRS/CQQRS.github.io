export async function resizeImageFile(file: File, maxDimension = 800): Promise<File> {
	if (!file.type.startsWith('image/')) {
		return file;
	}

	const objectUrl = URL.createObjectURL(file);

	try {
		const image = await new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error('Unable to load image for resizing.'));
			img.src = objectUrl;
		});

		const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
		const width = Math.max(1, Math.round(image.width * scale));
		const height = Math.max(1, Math.round(image.height * scale));

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d');
		if (!context) {
			return file;
		}

		context.drawImage(image, 0, 0, width, height);

		const blob = await new Promise<Blob | null>((resolve) => {
			const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
			canvas.toBlob(resolve, mimeType, 0.85);
		});

		if (!blob) {
			return file;
		}

		const safeName = file.name.replace(/\.[^/.]+$/, '') || 'photo';
		const fileName = `${safeName}_resized.${file.type === 'image/png' ? 'png' : 'jpg'}`;

		return new File([blob], fileName, {
			type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
			lastModified: Date.now(),
		});
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}