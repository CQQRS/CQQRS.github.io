import type { IApiReport } from "./IApiReport";
import { QSOType, type QSO } from "./QSO";
import { Report } from "./Report";

export class ApiReportToReportConvertor {

	public report: Report;

	constructor(apiReport: IApiReport){
		
		const qsoList = this.buildQsoList(apiReport);

		this.report = new Report(
			apiReport.name,
			apiReport.callsign,
			apiReport.grid,
			apiReport.comments,
			apiReport.caption,
			apiReport.submitted_at,
			apiReport.edition,
			apiReport.photo_filename,
			qsoList,
			apiReport.photo_mime,
			apiReport.photo_size
		);	
	}

	private buildQsoList(report: IApiReport): QSO[] {

		return [
			...this.extractQSOs( report.worked40, 40, QSOType.Worked ),
			...this.extractQSOs( report.worked80, 80, QSOType.Worked ),
			...this.extractQSOs( report.workedOther, 40, QSOType.Worked ),

			...this.extractQSOs( report.heard40, 40, QSOType.Heard ),
			...this.extractQSOs( report.heard80, 80, QSOType.Heard ),
			...this.extractQSOs( report.heardOther, 40, QSOType.Heard ),

			...this.extractQSOs( report.tried40, 40, QSOType.Tried ),
			...this.extractQSOs( report.tried80, 80, QSOType.Tried ),
			...this.extractQSOs( report.triedOther, 40, QSOType.Tried )
		];
	}

	private extractQSOs( stationList: string, 
		defaultBand: number, reportType: QSOType ): QSO[] {

		const extracted = this.extractBandAndCallsigns(
			stationList, defaultBand);
		
		const reportList = extracted.map( v=> {
			return {
				band: v.band,
				callsign: v.callsign,
				type: reportType
			}
		})

		return reportList;
	}

	private extractBandAndCallsigns( csList: string, defaultBand: number ): 
		{band: number, callsign: string	}[] {

		const output: {band: number, callsign: string	}[] = [];

		const regex = /[\s,]/g;
		csList = csList.replaceAll(regex, '|');
		
		csList.split(/\|+/g)
			.filter( v => v.length > 0 )	
			.map( v => {
			
				let [callsign, band] = this.splitBandFromCallsign(v);
				band = band > 0 ? band : defaultBand;

				output.push({
					band: band,
					callsign: callsign
				})
			});

		return output;
	}

	private splitBandFromCallsign(value: string): [string, number] {
		//The simplest way to understand the regex is to review the tests
		const regex = /(?:.{1,3}\/)?([^@\/]*)[^@]*(?:@[^\d]*(\d+))?/;
		const match = value.match(regex);
		const callsign = match?.[1] ?? "";
		const band = match?.[2] ?? "0";
		
		return [callsign.toUpperCase(), parseInt(band)];
	}
}