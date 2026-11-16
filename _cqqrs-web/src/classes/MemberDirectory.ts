import { environment } from "@site/environment/environment";
import path from "node:path";



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
	const url = environment.memberDirectoryPath;

	let data: IMemberEntry[];
	try {
		const response = await fetch( url);
		if( !response.ok) {
			throw new Error(`Could not download report.  ${response.statusText} (${response.status})`);
		}

		data = await response.json();
	}
	catch (ex) {
		throw new Error(`Could not retrieve member directory from: ${url}`);
	}

	const directory = new MemberDirectory();
	data.map(v => {
		directory.add(v.callsign, new MemberEntry(
			v.callsign, v.name, v.qth, v.grid, v.reported, new Date(v.lastActive)
		))
	});

	return directory;
}