import { UsageError } from "./Types";
import '../../_cqqrs-web/src/classes/DateExt';
export class Edition {
	public year: number;
	public week: number;

	/*
	If no edition string is supplied, the edition is set to the current date
	and week number;
	*/
	public constructor(edition?: string) {

		if (edition) {
			const regex = /(\d{4}).*(\d{2})/;
			const matches = edition.match(regex);
			if (!matches || matches?.length < 3) {
				throw new UsageError(`Invalid edition format: ${edition}`);
			}
			this.year = parseInt(matches[1]!);
			this.week = parseInt(matches[2]!);
		}
		else{
			const now = new Date();
			this.year = now.getUTCFullYear();
			this.week = now.getWeekNumber();

		}
	}
}
