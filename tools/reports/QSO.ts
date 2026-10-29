export class QSO {
	public band: number;
	public callsign: string;
	public type: QSOType;

	public constructor( band: number, callsign: string, type: QSOType ){
		if( isNaN(band)) throw new Error("Bade data type: Band.  Must be number");
		
		this.band = band;
		this.callsign = callsign;
		this.type = type;
	}
}

export enum QSOType {
	Heard = 0,
	Tried = 1,
	Worked = 2
}