export const environment: IReportEnvironment = {
	reportApiRoot: `https://conryclan.com/projects/cqqrsnet/reports`,
	reportSavePath: `data/reports`,
	memberDirectoryPath: "data/directory.json"
}

export interface IReportEnvironment {
	reportApiRoot: string;
	reportSavePath: string;
	memberDirectoryPath: string
}