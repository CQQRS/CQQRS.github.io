import { Edition } from "./reports/Edition";
import { environment } from "./reports/environment";
import { MCApiClient } from "./reports/MCApiClient";

export class MCCampaignBuilder {

	private _edition: Edition;
	private _apiClient: MCApiClient;
	private _campaignId: string = "";

	public get campaignId() {
		return this._campaignId;
	}

	constructor(edition?: Edition) {
		this._edition = edition ?? new Edition();
		this._apiClient = new MCApiClient();
	}

	public async createCampaign(): Promise<MCCampaignBuilder> {

		const prevTues = new Date();
		prevTues.setDate(prevTues.getDate() - (prevTues.getDay() + 5) % 7);

		const month = prevTues.getMonth().toString().padStart(2, "0");
		const date = prevTues.getDate().toString().padStart(2, "0");

		let title = `${prevTues.getFullYear()}-${month}-${date} CQQRS RagChew Newsletter `
			+ `${this._edition.week}/${this._edition.year}`;

		console.log(environment.mailchimp.templateId);
			/*
			this._campaignId = await this._apiClient.createCampaign(
			environment.mailchimp.templateId,
			environment.mailchimp.audienceId,
			title,
			title,
			"CQQRS RagChew",
			"cqqrsnet@gmail.com"
		);
		*/

		return this;
	}

}