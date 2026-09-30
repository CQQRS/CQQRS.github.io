import path from 'path';
import { google } from 'googleapis';
import { googleForm } from '../environment/environment';
import { UserResponse } from './UserResponse';


export class GoogleFormDownloader {

	/**
	* Retrieves all responses from a form.
	*/
	public async retrieveResponses(): Promise<IGoogleFormResponse> {

		const keyfilePath = path.join(__dirname, '../.credentials/cqqrs.ragchew.editor.json');

		const auth = new google.auth.GoogleAuth({
			keyFile: keyfilePath,
			scopes: [
				'https://www.googleapis.com/auth/forms.body.readonly',
				'https://www.googleapis.com/auth/forms.responses.readonly'
			]
		});

		// Create a new Forms API client.
		const formsClient = google.forms({
			version: 'v1',
			auth,
		});

		// Get the list of responses for the form.
		const result = await formsClient.forms.responses.list({
			formId: googleForm.formId,
		});

		return result as unknown as IGoogleFormResponse;
	}

	public toUserResponseList(formResponse: IGoogleFormResponse): UserResponse[] {


		formResponse.data.responses.map( gfResponse => {

			const response = new UserResponse();
			response.Callsign = this.extractFormValue(gfResponse.answers[QuestionCode.Callsign];



		})
		

	}

	private extractFormValue(src: IAnswer | undefined): string {
		return src?.textAnswers.answers[0]?.value ?? ""
	}

}



export interface IGoogleFormResponse {
	data: {
		responses: IResponse[]
	}
}

interface IResponse {
	responseId: string,
	createTime: string,
	lastSubmittedTime: string,
	answers: IAnswerKey
}

interface IAnswerKey {
	[key: string]: IAnswer
};

export interface IAnswer {
	questionId: string,
	textAnswers: {
		answers: { value: string }[]
	}
}

export enum QuestionCode {

	Callsign = "7a25411a",
	Name = "0e8d9d87",
	QTH = "7c22f4a2",
	Worked40 = "60a2475b",
	Heard40 = "0f14c2be",
	Heard80 = "1af3d085",
	Worked80 = "68a0451b",
	Comment40 = "0e70c164",
	CommentOther = "6058a8a6"
}