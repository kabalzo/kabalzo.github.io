function tierListCalculator() {
		var tierValues = {"S": 5, "A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
		var participants = ["tyler", "alex", "trevor", "jordan", "drew"]
		var gradeCounts = {"S": 0, "A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
		var finalGrade = ""
		var participantCount = 5
		var totalScore = 0
		var scoresAverage = 0

		//Assign number values to the letter grade scores inputed
		for (i=0; i <participants.length; i++) {
			var grade = document.getElementById(participants[i]).value.toUpperCase()
			var num = tierValues[grade];
			gradeCounts[grade] += 1
			//If nothing is entered in one of the fields
			if (num == undefined) {
				participantCount -= 1
			}
			else {
				totalScore += num;
			}
		};
		scoresAverage = totalScore/participantCount

		var trump = false
		var ceiling = 0
		for ([key, value] of Object.entries(gradeCounts)) {
			if (participantCount == 0) {
				finalGrade = ":("
			}
			else if (participantCount == 1) {
				finalGrade = key
			}
			
			/*
			else {
				if (ceiling < tierValues[key] && gradeCounts[key] > 0) {
					ceiling = tierValues[key]
				}
				//Check for trump case: n-1 votes for one grade equals that grade, where n is the number of votes
				if (value == (participantCount-1) && value > 1) {
					finalGrade = key
					trump = true
				} 
				//Alternative trump case where votes for one grade is n-2 but, one vote is greater than the common votes
				//Example: Without this 3xB, 1xF == B, but 2xB 1xA 1xF would equal C
				else if (value == (participantCount-2) && ceiling > tierValues[key] && gradeCounts[key] > 1) {
					finalGrade = key
					trump = true
				}
			}*/
		}
		
		//Assign a letter grade based on the average score if a trump case has not been met
		if (trump == false) {
			if (scoresAverage >= 4.5) {
				finalGrade = "S"
			} 
			else if (scoresAverage >= 3.5) {
				finalGrade = "A"
			}
			else if (scoresAverage >= 2.5) {
				finalGrade = "B"
			}
			else if (scoresAverage >= 1.5) {
				finalGrade = "C"
			}
			else if (scoresAverage >= 0.5) {
				finalGrade = "D"
			}
			else if (scoresAverage <= 0.4) {
				finalGrade = "F"
			}
		}
		document.getElementById("ranking").innerHTML = finalGrade;
		//document.getElementById("test1").innerHTML = "PARTICIPANTS: " + participantCount + ", TOTAL: " + totalScore + ", AVERAGE: " + scoresAverage;
		//document.getElementById("test2").innerHTML = "S: " + gradeCounts["S"] + ", A:" + gradeCounts["A"] + ", B:"+ gradeCounts["B"] + ", C:"+ gradeCounts["C"] + ", D:"+ gradeCounts["D"] + ", F: "+ gradeCounts["F"] + ", TRUMP: " + trump + ", CEILING: " + ceiling;

		//Reset default vaules each time the button is pressed
		gradeCounts = {"S": 0, "A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
		participantCount = 5
}
function myPassword() {
	var password = "onetruegod";
	(function passcodeprotect() {
	   var passcode = prompt("Enter PassCode");
	   while (passcode !== password) {
		  alert("Incorrect PassCode");
		  return passcodeprotect();
	   }
	}());
	alert('Welcome, ye of exquisite taste and culture.');
}