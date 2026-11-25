import { parseArgs } from "util";
import { MemberEntry } from "../_cqqrs-web/src/classes/MemberDirectory";
import { Edition } from "../_cqqrs-web/src/classes/Edition";
import { environment } from "../_cqqrs-web/environment/environment";
import { DataAccessError } from "../_cqqrs-web/src/classes/Errors";
import type { IApiReport } from "../_cqqrs-web/src/classes/IApiReport";
import { Report } from "../_cqqrs-web/src/classes/Report";
import { ApiReportToReportConvertor } from "../_cqqrs-web/src/classes/ApiReportToReportConvertor";
import { CqqrsApiClient } from "@site/src/classes/ApiClient/CqqrsApiClient";

const { values, positionals } = parseArgs({
	args: Bun.argv,
	options: {
		edition: {
			type: "string",
		}
	},
	strict: true,
	allowPositionals: true,
});

const edition = new Edition(values.edition || positionals[2]);

console.log(`Updating member directory from edition ${edition}`);

const api = new CqqrsApiClient();

//const directory = await api.members.getAll();
const reportList = await api.reports.getAll(edition.year, edition.week);

const trimmed = reportList.map(v => {

	const lastActive = new Date(v.submittedAt);
	lastActive.setHours(0, 0, 0, 0);

	const rptMember = new MemberEntry(
		v.callsign.root,
		v.name,
		v.qth,
		v.grid,
		[edition.toNumber()],
		lastActive
	);

	return rptMember;
});

const response = await api.members.upsert(trimmed);

console.log(response);