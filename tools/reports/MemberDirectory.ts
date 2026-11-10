import path from "node:path";

import { environment } from "./environment";

export class MemberDirectory{
	private _directory = new Map<string, MemberEntry>();

	public has(callsign: string) {
		return this._directory.has(callsign);
	}

	public toArray() {
		return [...this._directory];
	}

	public add(callsign: string, entry: MemberEntry){
		return this._directory.set(callsign, entry);
	}
}

export class MemberEntry{

	constructor(
		public callsign: string,
		public name: string,
		public qth: string,
		public grid: string,
		public reported: number[],
		public lastActive: Date
	){}

}

export interface IMemberEntry {
	callsign: string;
	name: string;
	qth: string;
	grid: string;
	reported: number[];
	lastActive: Date;
}

export async function loadMemberDirectory() {
	const dataPath = path.join(__dirname, `../../`, 
		environment.memberDirectoryPath);

	let data: IMemberEntry[];
	try {
		const file = Bun.file(dataPath);
		data = await file.json();
	}
	catch (ex) {
		throw new Error(`Could not open data file at: ${dataPath}`);
	}

	const directory = new MemberDirectory();
	data.map(v => {
		directory.add(v.callsign, new MemberEntry(
			v.callsign, v.name, v.qth, v.grid, v.reported, new Date(v.lastActive)
		))
	});

	return directory;
}