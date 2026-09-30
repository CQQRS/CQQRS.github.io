import { parseArgs } from "util";
import { MemberDirectory, type DirectoryEntry } from "../classes/MemberDirectory";
import { exit, exitCode } from "process";
import type { IUserResponse } from "../classes/UserResponse";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    reportFilePath: {
    	type: "string",
    },
	edition: {
		type: "string",
	}
  },
  strict: true,
  allowPositionals: true,
});

const edition = parseInt(values.edition!, 10);
if( !edition ){
	console.log( "--edition is required");
	exit(-2);
}

console.log(`Reading report output from ${values.reportFilePath}`);

let src: IUserResponse[];

try {
	src = await Bun.file("data.txt").json();
}
catch(ex){
	console.log(`There was an error reading the report file: ${ex}`);
	
	exit(-1);
}

const directory = new MemberDirectory();

src.map(v=> {
	const entry = directory.get(v.callsign)
		?? MemberDirectory.CreateEntry(v.callsign);

	entry.name = v.name;
	entry.qth = v.qth;
	
	if( !entry.reported.includes(edition)){
		entry.reported.push(edition);
	}
	
	const now = new Date();
	now.setHours(0,0,0);
	entry.lastActive == now.toISOString();

	directory.set(entry);

});

Bun.write("../data/directory1.json", JSON.stringify(directory.all()));
