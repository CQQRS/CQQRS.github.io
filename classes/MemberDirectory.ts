import * as srcData from "../data/directory.json"

export class MemberDirectory {

	private _data: Map<string,DirectoryEntry>;

	constructor() {
		this._data = new Map<string, DirectoryEntry>();

		(srcData as DirectoryEntry[]).map( v => {
			this._data.set(v.callsign, v);
		});
	}

	public all() {
		return [...this._data.values()];
	}

	public get(callsign: string){
		return this._data.get(callsign);
	}

	public set(entry: DirectoryEntry){
		this._data.set(entry.callsign, entry);
	}

	public static CreateEntry( callsign: string): DirectoryEntry{

		return {
			callsign: callsign,
			name: "",
			qth: "",
			grid: "",
			reported: [],
			lastActive: ""
		}
	}

}

export interface DirectoryEntry {
	callsign: string,
    name: string,
	qth: string,
	grid: string,
	reported: number[],
	lastActive: string
}