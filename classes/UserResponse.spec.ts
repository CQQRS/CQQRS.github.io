import { beforeEach, expect, test, describe } from "bun:test";
import { UserResponse } from "./UserResponse";
import { QuestionCode, type IResponse } from "./IGoogleFormResponse";

describe( "UserResponse", () => {

			// Arrange

			// Act

			//Assesrt

	describe( "reporter callsign", () => {

		let response: IResponse;

		beforeEach(() => {
			const worked80 = "VK1AA, VK1BB";

			response = generateResponse();
			response.answers[QuestionCode.Callsign]!.textAnswers.answers[0]!.value
				= "VK7TO ";
			response.answers[QuestionCode.Worked80]!.textAnswers.answers[0]!.value 
				= worked80;

		});

		test( "should strip whitespace", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.Callsign).toBe( "VK7TO");

		});
	});

	describe( "callsign extraction", () => {

		let response: IResponse;

		beforeEach(() => {
			const worked80 = " VK0AA  VK1AA , VK1BB, VK1BA/P, VK1BC/4, VK1CC@160, VK1CA@160/P"
				+ "VK1CA@160/4, VK4/VK2BB, VK4/VK2BC@160";

			response = generateResponse();
			response.answers[QuestionCode.Callsign]!.textAnswers.answers[0]!.value
				= "VK7TO";
			response.answers[QuestionCode.Worked80]!.textAnswers.answers[0]!.value 
				= worked80;

		});

		test( "should strip whitespace with spaces", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK0AA").length).toBe(1);

		});

		test( "should strip whitespace with commas", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1AA").length).toBe(1);

		});

		test( "should extract plain callsing", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1BB").length).toBe(1);

		});

		test( "should extract /P callsing", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1BA").length).toBe(1);

		});

		test( "should extract /# callsing", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1BC").length).toBe(1);

		});

		test( "should extract /p with band callsing", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1CA").length).toBe(1);

		});

		test( "should extract with prefix", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK2BB").length).toBe(1);

		});

		test( "should extract with prefix and band", () => {

			// Arrange

			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK2BC").length).toBe(1);

		});

	});

	describe( "band splitting", () => {
	
		let response: IResponse;

		beforeEach(() => {
			const worked40 = "VK1AA";
			const worked80 = "VK1BB, VK1CC@160, VK1DD@80, VK1EE@40, "
				+ "VK1FF@20, VK1GG@15, VK1HH@10, VK1II@6";

			response = generateResponse();
			response.answers[QuestionCode.Callsign]!.textAnswers.answers[0]!.value
				= "VK7TO";
			response.answers[QuestionCode.Worked40]!.textAnswers.answers[0]!.value 
				= worked40;
			response.answers[QuestionCode.Worked80]!.textAnswers.answers[0]!.value 
				= worked80;

		});

		test("should populate 40 by default", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1AA" && v.band == 40).length).toBe(1);	

		});

		test("should populate 80 by default", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1BB" && v.band == 80).length).toBe(1);	

		});

		test("should populate 160 from extraction", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1CC" && v.band == 160).length).toBe(1);

		});

		test("should populate 80 from extraction", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1DD" && v.band == 80).length).toBe(1);

		});

		test("should populate 40 from extraction", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1EE" && v.band == 40).length).toBe(1);

		});

		test("should populate 20 from extraction", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1FF" && v.band == 20).length).toBe(1);

		});

		test("should populate 15 from extraction", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1GG" && v.band == 15).length).toBe(1);

		});

		test("should populate 10 from extraction", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1HH" && v.band == 10).length).toBe(1);

		});

		test("should populate 6 from extraction", ()=> {

			// Arrange
			
			// Act
			const userResponse = new UserResponse(response);

			// Assert
			expect( userResponse.reportList.filter(v=> 
				v.callsign == "VK1II" && v.band == 6).length).toBe(1);

		});
	});

});

function generateResponse(): IResponse {

	return {
		responseId: "123",
		createTime: "2024-06-01T00:00:00Z",
		lastSubmittedTime: "2024-06-01T00:00:00Z",
		answers: {
			[QuestionCode.Callsign]: {
				questionId: QuestionCode.Callsign,
				textAnswers: {
					answers: [
						{value: "" }
					]
				}
			},
			[QuestionCode.Worked40]: {
				questionId: QuestionCode.Worked40,
				textAnswers: {
					answers: [
						{ value: "" }
					]
				}
			},
			[QuestionCode.Worked80]: {
				questionId: QuestionCode.Worked80,
				textAnswers: {
					answers: [
						{ value: "" }
					]
				}
			}
		}
	};

}