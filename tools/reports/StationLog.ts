import type { Callsign } from "../../models/Callsign";
import type { QSO } from "./QSO";

export class StationLog {
	
	constructor( public callsign: Callsign, public qsoList: QSO[] ){

	}

	sortQsoList() {
		this.qsoList.sort((a, b) => {
			//first non-zero value dictates the sort.
			return b.band - a.band ||
				b.type.toString().localeCompare(a.type.toString()) ||
				a.callsign.root.length - b.callsign.root.length;
		});
	}
}
