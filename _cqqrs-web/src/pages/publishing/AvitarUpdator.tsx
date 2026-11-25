import { type ChangeEvent, type CSSProperties, useRef, useMemo, useState } from 'react'
import Admonition from '@theme/Admonition';

import Cropper, { Area, type Point } from 'react-easy-crop'

import formStyles from '../../components/style/form.module.css';
import { SubmitStatus } from '@site/src/classes/SubmitStatus';
import { PhotoInputBlock } from '@site/src/components/ReportForm/PhotoInputBlock';
import { environment } from '@site/environment/environment';

async function getCroppedImg(
	imageSrc: string,
	pixelCrop: Area,
	rotation = 0,
	flip = { horizontal: false, vertical: false },
	maxWidth = 500
) {
	const image = await createImage(imageSrc)
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')

	if (!ctx) {
		return null
	}

	const rotRad = getRadianAngle(rotation)
	const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

	canvas.width = bBoxWidth
	canvas.height = bBoxHeight

	ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
	ctx.rotate(rotRad)
	ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
	ctx.translate(-image.width / 2, -image.height / 2)
	ctx.drawImage(image, 0, 0)

	const croppedCanvas = document.createElement('canvas')
	const croppedCtx = croppedCanvas.getContext('2d')

	if (!croppedCtx) {
		return null
	}

	// Scale the canvas dimensions based on maxWidth
	const scale = Math.min(1, maxWidth / pixelCrop.width)
	croppedCanvas.width = pixelCrop.width * scale
	croppedCanvas.height = pixelCrop.height * scale

	croppedCtx.drawImage(
		canvas,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width * scale,
		pixelCrop.height * scale
	)

	return new Promise<string | null>((resolve) => {
		croppedCanvas.toBlob((file) => {
			resolve(file ? URL.createObjectURL(file) : null)
		}, 'image/jpeg')
	})
}

function createImage(url: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image()
		image.addEventListener('load', () => resolve(image))
		image.addEventListener('error', reject)
		image.setAttribute('crossOrigin', 'anonymous')
		image.src = url
	})
}

function getRadianAngle(degreeValue: number) {
	return (degreeValue * Math.PI) / 180
}

function rotateSize(width: number, height: number, rotation: number) {
	const rotRad = getRadianAngle(rotation)

	return {
		width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
		height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
	}
}

export default function AvitarUpdator() {
	const [image, setImage] = useState<File[]>([]);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
	const [zoom, setZoom] = useState(1)
	const [callsign, setCallsign] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [submitStatus, setSubmitStatus] = useState(SubmitStatus.Idle);
	const [rotation, setRotation] = useState(0)
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

	function reset() {
		setImage([]);
		setImageUrl("");
		setCallsign("");
		setErrorMsg("");
	}

	function callsignChanged(event: ChangeEvent<HTMLInputElement>) {
		setCallsign(event.currentTarget.value);
	}

	function handleImageChange(files: File[]) {
		setImage(files);
		if (files.length > 0) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setImageUrl(e.target?.result as string);
			};
			reader.readAsDataURL(files[0]);
		}
	};

	function removePhoto() {
		setImage([]);
		setImageUrl("");
	}

	async function handleGoClick(_e: React.MouseEvent<HTMLButtonElement>) {
		setErrorMsg("");
		setSubmitStatus(SubmitStatus.Submitting);
		try {
			await uploadImage();
		} catch (ex: any) {
			setErrorMsg(ex.message);
			setSubmitStatus(SubmitStatus.Error);
		}
	};

	function onCropComplete(_: Area, croppedPixels: Area) {
		setCroppedAreaPixels(croppedPixels)
	}

	async function uploadImage() {

		if (!imageUrl) {
			throw new Error("No image selected");
		}

		if (!callsign || callsign.trim() === "") {
			throw new Error("Callsign is required");
		}

		const url = `${environment.cqqApiRoot}/members/${callsign}/avitar`

		console.log("Uploading to:", url);
		console.log("Image URL:", imageUrl.substring(0, 50) + "...");

		try {
			// Extract cropped image from canvas
			if( croppedAreaPixels === null ) {

			}

			const croppedImgSrc = croppedAreaPixels !== null
				? await getCroppedImg(imageUrl, croppedAreaPixels,
					rotation)
				: imageUrl;

			const croppedBlob = await fetch(croppedImgSrc!).then(response => {
				if (!response.ok) {
					throw new Error("Failed to convert cropped image to Blob");
				}
				return response.blob();
			});

			console.log("Cropped blob size:", croppedBlob.size);

			// Use FormData to send the file properly
			const formData = new FormData();
			formData.append('file', croppedBlob, 'avatar.jpg');

			const request = await fetch(url, {
				method: "POST",
				body: formData,
			});

			console.log("Response status:", request.status, request.statusText);

			if (!request.ok) {
				const errorText = await request.text();
				console.error(`Upload failed with status ${request.status}:`, errorText);
				throw new Error(`Upload failed: ${request.status} ${request.statusText}. ${errorText}`);
			}

			setSubmitStatus(SubmitStatus.Success);
			reset();
			setTimeout(()=> setSubmitStatus(SubmitStatus.Idle), 2000 );
		} catch (error) {
			console.error("Upload error:", error);
			throw error;
		}

	};

	const photoWrapper: CSSProperties = {
		width: "400px",
		height: "400px",
		position: "relative"
	};

	const photoCloseButton: CSSProperties = {
		position: "absolute",
		top: -8,
		right: -8,
		width: 32,
		height: 32,
		borderRadius: "50%",
		backgroundColor: "#ef4444",
		color: "white",
		border: "none",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: 18,
		boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
		transition: "background-color 0.2s ease",
	}


	return (
		<>
			<label className={formStyles.labelStyle}>Member Callsign</label>
			<div>
				<input className={formStyles.inputStyle}
					style={{ width: "130px" }}
					value={callsign}
					onChange={callsignChanged}
				></input>
			</div>

			<div style={photoWrapper}>
				{image.length === 0 &&
					<PhotoInputBlock
						onChange={handleImageChange}
					/>
				}

				{image.length > 0 &&
					<>
						<div className="cropper">
							<Cropper
								image={imageUrl}
								crop={crop}
								zoom={zoom}
								minZoom={1}
								maxZoom={10}
								aspect={1}
								cropShape="round"
								showGrid={true}
								onCropChange={setCrop}
								onZoomChange={setZoom}
								onCropComplete={onCropComplete}
								onRotationChange={setRotation}
							/>
						</div>

						<button
							type="button"
							onClick={() => removePhoto()}
							style={photoCloseButton}
							title="Remove photo"
							aria-label={`Remove photo`}
						>
							✕
						</button>
					</>
				}
			</div>

			<div>
				<button type="button"
					className={formStyles.buttonStyle}
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
		</>
	)
}