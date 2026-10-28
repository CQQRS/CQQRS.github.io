import { UsageError } from "./Types";

export class Edition {
	public year: number;
	public week: number;

	public constructor(edition: string) {
		const regex = /(\d{4}).*(\d{2})/;
		const matches = edition.match(regex);
		if (!matches || matches?.length < 3) {
			throw new UsageError(`Invalid edition format: ${edition}`);
		}
		this.year = parseInt(matches[1]!);
		this.week = parseInt(matches[2]!);
	}
}
