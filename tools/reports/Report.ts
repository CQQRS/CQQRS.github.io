import { Callsign } from "../../models/Callsign";
import { type QSO } from "./QSO";

export class Report {

	public readonly callsign: Callsign;

	constructor( 
		public readonly name: string,
		callsign: string,
		public readonly qth: string,
		public readonly grid: string,
		public readonly comments: string,
		public readonly caption: string,
		public readonly submittedAt: string,
		public readonly edition: string,
		public readonly photos: IPhoto[],
		public readonly qsoList: QSO[],
	){
		this.callsign = new Callsign(callsign);
	}

	public addQSO(qso: QSO): void {
		this.qsoList.push(qso);
	}
}

export interface IPhoto {
	filename: string,
	mime: string,
	size: number
}