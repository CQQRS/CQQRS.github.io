import type { Callsign } from "../../models/Callsign";
import { QSOType, type QSO } from "./QSO";
import type { TLog } from "./Types";
import type { StationLog } from "./StationLog";
import { LogCollection } from "./LogCollection";

export class ReverseLog {

	private readonly _logCol: LogCollection;

	public constructor(log: LogCollection) {
		this._logCol = this.buildReverseLog(log)
	}

	public toLogCollection() {
		return this._logCol;
	}

	private buildReverseLog(logCol: LogCollection): LogCollection {

		const output = new LogCollection();

		logCol.forEach((log: StationLog) => {
			//if( !["VK7JZ", "M0NNK"].includes(log.callsign.root)) return;
			log.qsoList.forEach(qso => {
				//if( !["VK7JZ", "M0NNK"].includes(qso.callsign.root)) return;

				const stationHeard = output.getOrInsert(qso.callsign, []);

				const existing = stationHeard.find(v => v.callsign.root == log.callsign.root
					&& v.band == qso.band
				)

				if (existing) {
					if( existing.type < qso.type) {
						existing.type = qso.type;
					}
				}
				else {
					stationHeard.push({
						band: qso.band,
						callsign: log.callsign,
						type: qso.type
					});
				}

				if (qso.type === QSOType.Worked) {
					//Ensure the reporter has it in their list too.
					const reporterOut = output.getOrInsert(log.callsign, []);

					if (!reporterOut.find(v => v.callsign.root == qso.callsign.root
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