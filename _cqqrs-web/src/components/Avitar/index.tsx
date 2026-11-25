import { useEffect, useState, type CSSProperties } from "react";

import { environment } from "@site/environment/environment";

interface AvitarProps {
	callsign: string,
	height?: string
}
export default function Avitar({ callsign, height = "60px" }: AvitarProps) {

	const [url, setUrl] = useState<string|undefined>(undefined);

	useEffect(() => {

		setUrl(`${environment.cqqApiRoot}/members/${callsign}/avitar`);

	}, []);

	const containerStyle = {
		display: 'inline-block'
	}

	const imageStyle: CSSProperties = {
		width: `${height}`,
		height: `${height}`,
		objectFit: "cover",
		borderRadius: `50%`
	}

	return (
		<div style={containerStyle}>
			<img src={url}
				style={imageStyle}
				onError={(e)=>{
					e.currentTarget.onerror = null;
					e.currentTarget.src = '/img/person-placeholder.jpg';
					e.currentTarget.style.opacity = '5%';
				}}
			></img>
		</div>
	);
}