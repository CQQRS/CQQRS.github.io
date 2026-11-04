import { Report, type IPhoto } from "./Report";

export interface IApiReport {
	name: string,
	callsign: string,
	qth: string,
	grid: string,
	heard40: string,
	worked40: string,
	tried40: string,
	heard80: string,
	worked80: string,
	tried80: string,
	heardOther: string,
	workedOther: string,
	triedOther: string,
	comments: string,
	caption: string,
	submitted_at: string,
	edition: string,
	photos: IPhoto[]
}