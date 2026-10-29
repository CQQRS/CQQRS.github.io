export const environment: IReportEnvironment = {
	reportApiRoot: `https://conryclan.com/projects/cqqrsnet/reports`,
	resourceApiRoot: `https://conryclan.com/projects/cqqrsnet/resource`,
	reportSavePath: `data/reports`,
	memberDirectoryPath: "data/directory.json",
	ragchewContributingEditors: "VK6HRC VK3ACU"
}

export interface IReportEnvironment {
	reportApiRoot: string;
	resourceApiRoot: string;
	reportSavePath: string;
	memberDirectoryPath: string;
	ragchewContributingEditors: string;
}