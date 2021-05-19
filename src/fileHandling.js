const colors = require("colors");
const fs = require("fs");

//read keywords from the keywords txt file
const readKeyWords = async () => {
	try {
		return fs.readFileSync(__dirname + "/files/keywords.txt", "utf8").split("\n");
	} catch (err) {
		writeErrors("readKeyWords function errors", err);
		console.error(
			colors.red(
				"Error with reading keywords - please refer to the error file to see the error logs"
			)
		);
	}
};

//write matching keywords and locations to the output txt file
const writeOutput = (url, foundKeywords, foundLocations) => {
	const content =
		"\n" +
		"URL: " +
		url.toString() +
		"\n" +
		"Keywords: " +
		foundKeywords.toString() +
		"\n" +
		"Locations mentioned: " +
		foundLocations.toString() +
		"\n" +
		"\n" +
		"==============================================" +
		"\n";

	fs.appendFileSync(
		__dirname + "/files/output.txt",
		content,
		"UTF-8",
		{ flags: "a+" },
		(err) => {
			if (err) {
				console.error(colors.red(err));
				return;
			}
		}
	);
};

//write errors to the erros txt file
const writeErrors = (msg, err) => {
	const content =
		msg +
		"\n" +
		err +
		"\n" +
		"========================================================" +
		"\n";

	fs.appendFileSync(
		__dirname + "/files/erros.txt",
		content,
		"UTF-8",
		{ flags: "a+" },
		(err) => {
			if (err) {
				console.error(colors.red(err));
				return;
			}
		}
	);
};

module.exports = { readKeyWords, writeOutput, writeErrors };
