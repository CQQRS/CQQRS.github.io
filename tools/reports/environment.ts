export const environment: IReportEnvironment = {
	reportApiRoot: `https://conryclan.com/projects/cqqrsnet/reports`,
	resourceApiRoot: `https://conryclan.com/projects/cqqrsnet/resource`,
	reportSavePath: `data/reports`,
	memberDirectoryPath: "data/directory.json",
	ragchewContributingEditors: "VK6HRC VK3ACU",

	mailchimp: {
		templateId: 10055611,
		audienceId: "8640b3cd58"
	}
}

export interface IReportEnvironment {
	reportApiRoot: string;
	resourceApiRoot: string;
	reportSavePath: string;
	memberDirectoryPath: string;
	ragchewContributingEditors: string;

	mailchimp: {
		templateId: number,
		audienceId: string
	}
}