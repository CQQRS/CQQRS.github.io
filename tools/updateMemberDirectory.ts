import { parseArgs } from "util";
import { exit, exitCode } from "process";
import { loadMemberDirectory, MemberDirectory, MemberEntry, saveMemberDirectory } from "../_cqqrs-web/src/classes/MemberDirectory";
import { Edition } from "../_cqqrs-web/src/classes/Edition";
import { environment } from "../_cqqrs-web/environment/environment";
import { DataAccessError } from "../_cqqrs-web/src/classes/Errors";
import type { IApiReport } from "../_cqqrs-web/src/classes/IApiReport";
import { Report } from "../_cqqrs-web/src/classes/Report";
import { ApiReportToReportConvertor } from "../_cqqrs-web/src/classes/ApiReportToReportConvertor";

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

const directory = await loadMemberDirectory();
const reportList = await loadReportList(edition);

reportList.map(v => {

	const lastActive = new Date(v.submittedAt);
	lastActive.setHours(0, 0, 0, 0);

	const rptMember = new MemberEntry(
		v.callsign.root,
		v.name,
		v.qth,
		v.grid,
		[],
		lastActive
	);

	const dirMember = directory.get(v.callsign.root);

	rptMember.reported = [...(new Set([edition.toNumber(), ...(dirMember?.reported ?? []) ]))];
	rptMember.reported.sort();

	directory.set(v.callsign.root, rptMember);
});

saveMemberDirectory(directory);


async function loadReportList(edition: Edition): Promise<Report[]> {
	const url = `${environment.reportApiRoot}/${edition.year}_` +
		`${edition.week}/entries.json`;

	const response = await fetch(url);
	if (!response.ok) {

		if (response.status == 404) {
			throw new DataAccessError("No reports were found for this edition.")
		}

		throw new Error(`Could not download report.  ${response.statusText} (${response.status})`);
	}

	const data = await response.json() as IApiReport[];
	const reportList = data.map(v => new ApiReportToReportConvertor(v).report);

	return reportList;
}