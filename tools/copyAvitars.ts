import { environment } from "@site/environment/environment";
import { CqqrsApiClient, HttpError } from "@site/src/classes/ApiClient/CqqrsApiClient";

const api = new CqqrsApiClient();
let members = await api.members.getAll();
members = members.filter(v => v.name !== '');

for (const v of members) {

	console.log("Checking ", v.callsign);
	try {

		await api.members.getAvatar(v.callsign);
		continue;	//It already exists

	}
	catch (ex: unknown) {

		if (ex instanceof HttpError) {
			if (ex.status !== 404) {
				console.log(`HttpError: `, ex.status);
			}
		}
		else {
			console.log(ex);
		}
	}

	try {
		console.log("Uploading ", v.callsign);

		const url = `${environment.cqqApiRoot}/../../resource/avitar/${v.callsign}_1.jpg`;
		const response = await fetch(url);
		const blob = await response.blob();
		const file = new File([blob], `${v.callsign}.jpg`, { type: 'image/jpeg' });
		await api.members.uploadAvatar(v.callsign, file);

	}
	catch (ex) {
		if (ex instanceof HttpError) {
			console.log(`HttpError: `, ex.status, ex.message);
		}
		else {
			console.log(ex);
		}
	}

};