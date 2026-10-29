import { Callsign } from "../../models/Callsign";
import { type QSO } from "./QSO";

export class Report {

	constructor( 
		public readonly name: string,
		public readonly callsign: string,
		public readonly qth: string,
		public readonly grid: string,
		public readonly comments: string,
		public readonly caption: string,
		public readonly submittedAt: string,
		public readonly edition: string,
		public readonly photoFilename: string,
		public readonly qsoList: QSO[],
		public readonly photoMime: string = "",
		public readonly photoSize: string = ""
	){
		this.callsign = new Callsign(this.callsign).root;
	}

	public addQSO(qso: QSO): void {
		this.qsoList.push(qso);
	}	
}