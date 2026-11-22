import { MemberEntry } from "@site/src/classes/MemberDirectory";
import { ReactNode, useEffect, useState } from "react";

export enum ContribTitleType {
	LettersToEd,
	Notice
}

export enum ContribImageType {
	Banner,
	Other,
	None
}

interface ContribTitleProps {
	type: ContribTitleType,
	callsign: string,
	title: string,
	imageType: ContribImageType,
	imageSrc: string,
	children: ReactNode
}
export default function Contrib({
	type,
	callsign,
	title,
	imageType = ContribImageType.None,
	imageSrc = "",
	children
}: ContribTitleProps) {

	

	useEffect(() => {
		// one-shot
	}, []);

	

	const callsignStyle = {
		display: 'inline',
		fontWeight: 'var(--ifm-font-weight-bold)' as const,
		margin: '6px',
		fontSize: '0.9rem',
		color: 'var(--ifm-color-emphasis-700)',
	};

	const titleStyle = {
		display: 'inline',
		fontWeight: 'var(--ifm-font-weight-bold)' as const,
		margin: '6px',
		fontSize: '0.9rem',
		color: 'var(--ifm-color-emphasis-700)',
	};

	const contentsStyle = {
	};

	return (
		<>
			<div className="header">
				<div style={callsignStyle}>{callsign}</div>
				<div style={titleStyle}>{title}</div>
			</div>

			{imageType === ContribImageType.Banner && (
				<div>
					<img src={imageSrc}></img>
				</div>
			)}

			<div style={contentsStyle}>
				{children}
			</div>

			{imageType === ContribImageType.Other && (
				<div>
					<img src={imageSrc}></img>
				</div>
			)}
			
			<hr></hr>
		</>
	);

}