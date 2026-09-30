import { QuestionCode, type IResponse } from "./IGoogleFormResponse";
import { ReportType, type IReport } from "./IReport";

export class UserResponse {
	
	public Callsign: string = "";
	public Name: string = "";
	public QTH: string = "";
	public Worked: string = "";
	public Heard: string = "";
	public Comment40: string = "";
	public CommentOther: string = "";

	public Created: Date;

	public reportList: IReport[] = [];
	
	makeme( response: IResponse) {

		Object.values(response.answers).map( answer => {
			const question = this._qDict.get(answer.questionId);
			if (question) {
				question(answer.textAnswers.answers[0]!.value);
			}
		});

		this.Callsign = this.Callsign.toUpperCase().trim();
		this.Created = new Date(response.createTime);

		const worked40 = this.extractWorkedHeardAnswers( response, 
			QuestionCode.Worked40, 40, ReportType.Worked );

		const worked80 = this.extractWorkedHeardAnswers( response, 
			QuestionCode.Worked80, 80, ReportType.Worked );

		const heard40 = this.extractWorkedHeardAnswers( response, 
			QuestionCode.Heard40, 40, ReportType.Heard );

		const heard80 = this.extractWorkedHeardAnswers( response, 
			QuestionCode.Heard80, 80, ReportType.Heard );

		this.reportList.push( ...worked40, ...worked80, ...heard40, ...heard80 );
	}

	private extractWorkedHeardAnswers( response: IResponse, key: QuestionCode, 
		defaultBand: number, reportType: ReportType ): IReport[] {

		const answer = response.answers[key];
		if( !answer ) return [];

		const extracted = this.extractBandAndCallsigns(
			answer.textAnswers.answers[0]!.value, defaultBand);
		
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

	public print() {
		console.log( `Callsign ➔ `, this.Callsign);
		console.log( `Name ➔ `, this.Name);
		console.log( `QTH ➔ `, this.QTH);
		console.log( `Comment 40 ➔ `, this.Comment40);
		console.log( `Comment Other ➔ `, this.CommentOther);

		this.reportList.forEach((report) => {
			console.log( `${report.type} ${report.band} ➔ `, report.callsign);
		});

		console.log(``);
	}
}

export interface IUserResponse {
	callsign: string,
	name: string,
	qth: string,
	worked40: string,
	worked80: string,
	heard40: string,
	heard80: string,
	tried40: string,
	tried80: string,
	comments40: string,
	comments80: string
}