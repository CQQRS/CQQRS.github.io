import { Callsign } from "../../models/Callsign";
import { StationLog } from "./StationLog";
import { QSO } from "./QSO";

export class LogCollection {

	private _index = new Map<string, StationLog>();

	public get size() {
		return this._index.size;
	}

	public constructor(logList: StationLog[] = []) {

		logList.map(v=> {
			this._index.set(v.callsign.root, v);
		});
	}

	public forEach(callback: (value: StationLog, key: string) => void): void {
		this._index.forEach(callback);
	}

	public getOrInsert(callsign: Callsign, qsoList: QSO[]) {
		return this._index.getOrInsert(callsign.root, 
			new StationLog(callsign, qsoList)
		).qsoList;
	}

	public sortByStationsLogCallsign() {
		const sorted = [...this._index.entries()].sort((a, b) => 
			a[1].callsign.toString().localeCompare(b[1].callsign.toString()))
		this._index = new Map<string, StationLog>(sorted);
	}
	
	public filter(expression: (log: StationLog) => boolean): LogCollection {

		const filtered = [...this._index.values()].filter(expression);
		return new LogCollection(filtered);

	}

	// Implement the iterator protocol to support spreading
	*[Symbol.iterator]() {
		for (const item of this._index) {
		yield item;
		}
	}
}

