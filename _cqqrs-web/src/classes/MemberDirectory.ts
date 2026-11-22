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

export async function loadMemberDirectory( ) {
	
	const srcPath = environment.memberDirectoryPath;

	let data: IMemberEntry[];
	try {
		const response = await fetch(srcPath);
		if( !response.ok) {
			throw new Error(`Could not download report.  ${response.statusText} (${response.status})`);
		}

		data = await response.json();
	}
	catch (ex) {
		throw new Error(`Could not retrieve member directory from: ${srcPath}`);
	}

	const directory = new MemberDirectory();
	data.map(v => {
		directory.add(v.callsign, new MemberEntry(
			v.callsign, v.name, v.qth, v.grid, v.reported, new Date(v.lastActive)
		))
	});

	return directory;
}

export async function loadMemberDirectoryFromFile( srcPath: string): 
	Promise<MemberDirectory> {

	const path = srcPath;
	const file = Bun.file(path);

	const data: IMemberEntry[] = await file.json();

	const directory = new MemberDirectory();
	data.map(v => {
		directory.add(v.callsign, new MemberEntry(
			v.callsign, v.name, v.qth, v.grid, v.reported, new Date(v.lastActive)
		))
	});

	return directory;
}

export async function saveMemberDirectoryToFile( memberDirectory: MemberDirectory, 
	savePath: string) {

	const members = memberDirectory.members()
		.sort((a,b)=> 
			a.callsign.localeCompare(b.callsign));

	Bun.write(savePath, JSON.stringify(members, null, 2));
}