import { environment } from "@site/environment/environment";

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

	public get(callsign: string) {
		return this._directory.get(callsign);
	}

	public getOrInsert(callsign: string, entry: MemberEntry){
		return this._directory.getOrInsert(callsign, entry);
	}

	public set(callsign: string, entry: MemberEntry){
		return this._directory.set(callsign, entry);
	}

	public members(): MemberEntry[] {

		return [...this._directory.values()];
	}
}

export class MemberEntry{

	constructor(
		public callsign: string,
		public name: string,
		public qth: string,
		public grid: string,
		public reported: number[],  // edition as yyyy.ww
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
	const url = `../../static/data/directory.json`;

	let data: IMemberEntry[];
	try {
		const response = await fetch( new URL(url, import.meta.url));
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

export async function saveMemberDirectory( memberDirectory: MemberDirectory) {
	const path = `../../static/data/directory.json`;

	const members = memberDirectory.members()
		.sort((a,b)=> 
			a.callsign.localeCompare(b.callsign));

	Bun.write(new URL(path, import.meta.url), JSON.stringify(members, null, 2));
}