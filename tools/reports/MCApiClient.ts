import mailchimp from '@mailchimp/mailchimp_marketing';

const SERVER_PREFIX = "us14";

export class MCApiClient {

	constructor() {

		//check that env variables exist:
		const envApiKeyName = "MAILCHIMP_API_KEY"
		const apiKey = Bun.env[envApiKeyName] ?? "";
		if (apiKey.length === 0) {
			throw new Error(`${envApiKeyName} environment variable required.`)
		}

		mailchimp.setConfig({
			apiKey: apiKey,
			server: SERVER_PREFIX
		})

	}

	public async createCampaign(templateId: number, audienceId: string, title: string,
		subject: string, fromName: string, replyTo: string
	): Promise<string> {

		const response = await mailchimp.campaigns.create({
			type: "regular",
			content_type: "multichannel",
			recipients: {
				list_id: audienceId,
			},
			settings: {
				title: title,
				subject_line: subject,
				from_name: fromName,
				reply_to: replyTo,
				template_id: templateId
			},
		} as unknown as mailchimp.campaigns.CreateCampaignParameters);

		this.throwOnErrorResponse(response);

		return (response as mailchimp.campaigns.Campaigns).id;
	}

	private throwOnErrorResponse(response: Partial<mailchimp.ErrorResponse & any>) {

		if (!isNaN(response.status)) {
			if ((response.status as number) >= 400) {
				throw new Error(response.detail ?? JSON.stringify(response));
			}
		}
	}
}