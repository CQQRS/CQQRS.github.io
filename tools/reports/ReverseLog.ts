import { QSOType, type QSO } from "./QSO";
import type { TLog } from "./Types";

export class ReverseLog {

	public readonly log: TLog;

	public constructor(log: TLog) {
		this.log = this.buildReverseLog(log)
	}

	private buildReverseLog(log: TLog): TLog {

		const output = new Map<string, QSO[]>();
		const typeOrder = [QSOType.Worked, QSOType.Tried, QSOType.Heard];

		log.forEach((qsoList: QSO[], callsign: string) => {
			qsoList.forEach(qso => {
				const stationHeard = output.getOrInsert(qso.callsign, []);

				const existing = stationHeard.find(v => v.callsign == callsign
					&& v.band == qso.band
				)

				if (existing) {

					//If the same station was logged with two types, use the 
					// "strongest" contact type.
					
					//TerminalOutput.log(`${callsign} => ${qso.callsign} : ${existing.type} => ${qso.type} `);

					if( existing.type < qso.type) {
						
						existing.type = qso.type;

						//TerminalOutput.success(`UPDATED`);
					}

					//TerminalOutput.log("\n");
				}
				else {
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