import { IReportEnvironment } from "./IEnvironment";

export const environment: IReportEnvironment = {
	reportApi: "https://conryclan.com/projects/cqqrsnet/api/report.php",
	reportApiRoot: `https://conryclan.com/projects/cqqrsnet/reports`,
	resourceApiRoot: `https://conryclan.com/projects/cqqrsnet/resource`,
	reportSavePath: `/data/reports`,
	memberDirectoryPath: "/data/directory.json",
	ragchewContributingEditors: "VK6HRC VK3ACU",

	mailchimp: {
		templateId: 10055611,
		audienceId: "8640b3cd58"
	}
}