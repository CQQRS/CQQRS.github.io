export interface IReportEnvironment {
	cqqApiRoot: string;
	reportApi: string;
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