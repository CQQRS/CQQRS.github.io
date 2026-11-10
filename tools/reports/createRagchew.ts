import { MCCampaignBuilder } from "../MCCampaignBuilder";
import { Edition } from "./Edition";
import { UsageError } from "./Types";

try{
	
	if( Bun.argv.length < 3) {
		//throw new UsageError("No edition specified");
	}

	const edition = new Edition(Bun.argv[2]!);

	const builder = new MCCampaignBuilder(edition);
	await builder.createCampaign();

}
catch( ex: any) {

	if( ex instanceof UsageError ) {
		console.error(ex.message);
		console.log();
		console.log(`Usage: createRagchew <year>/<week>`);
		console.log(`\t eg. createRagchew 2020/44`);
	}
	else{
		console.error(ex.message);
	}
}