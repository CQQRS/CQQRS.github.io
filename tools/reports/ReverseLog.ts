import { QSOType, type QSO } from "./QSO";
import { Report } from "./Report";
import type { TLog } from "./Types";

export class ReverseLog {

	public readonly log: TLog;

	public constructor(log: TLog) {
		this.log = this.buildReverseLog(log)
	}

	private buildReverseLog(log: TLog): TLog {

		const output = new Map<string, QSO[]>();

		log.forEach((qsoList: QSO[], callsign: string) => {
			qsoList.forEach(qso => {
				const stationHeard = output.getOrInsert(qso.callsign, []);

				if (!stationHeard.find(v => v.callsign == callsign
					&& v.band == qso.band
				)) {
					stationHeard.push({
						band: qso.band,
						callsign: callsign,
						type: qso.type
					});
				}

				if (qso.type === QSOType.Worked) {
					//Ensure the reporter has it in their list too.
					const reporterOut = output.getOrInsert(callsign, []);

					if (!reporterOut.find(v => v.callsign == qso.callsign
						&& v.band == qso.band
					)) {
						reporterOut.push({
							band: qso.band,
							callsign: qso.callsign,
							type: qso.type
						});
					}
				}

			});
		});

		return output;


	}
}