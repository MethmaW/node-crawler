const fetch = require("node-fetch");
const colors = require("colors");
const cheerio = require("cheerio");
const fs = require("fs");
const Location = require("./db/models/locations");
const dotenv = require("dotenv");
const connectDB = require("./db/index");
const { findSubLinks, compareDomains } = require("./validations");
const { readKeyWords, writeOutput, writeErrors } = require("./fileHandling");
const { getLocations } = require("./handleDbCalls");

dotenv.config();

//find matching keywords and locations in websites
const find = (keys, text) => {
	return keys.filter((keyword) => {
		return text.toLowerCase().includes(keyword.toLowerCase());
	});
};

//crawl the urls
const crawl = async (url, isMain = false) => {
	try {
		let success = false;

		//compare with existing urls
		if (compareDomains(url)) {
			return;
		}

		//get keywords and locations
		const keywords = await readKeyWords();
		const locations = await getLocations();

		//fetch html from urls
		const response = await fetch(url);
		const html = await response.text();

		//load cheerio from html
		const $ = cheerio.load(html);
		const body = $("body");
		const output = body.find("body p, h1, h2, h3, h4, h5, h6").text();

		console.log(
			"-----------------------------------------------------------------------------"
		);
		console.log(colors.blue("Crawling the url: ", url));

		//create found keywords and locations array
		const foundKeywords = find(keywords, output);
		const foundLocations = find(locations, output);

		console.log(colors.yellow("Keywords found: ", foundKeywords));
		console.log(colors.yellow("Locations found: ", foundLocations));

		if (foundKeywords.length > 0 || foundLocations.length > 0) {
			writeOutput(url, foundKeywords, foundLocations);
			success = true;
		}

		//search for sublinks
		if (isMain) {
			const subLinks = findSubLinks(body);

			let index = 0;
			let urlCount = 0;
			while (urlCount < 5 && index <= subLinks.length - 1) {
				let contentFound;

				if (!compareDomains(subLinks[index])) {
					contentFound = await crawl(subLinks[index], false);
				}

				index++;

				if (contentFound) {
					urlCount++;
				}
			}

			console.log(
				colors.green("---------------Ending the Crawling process---------------")
			);
		}

		return success;
	} catch (err) {
		writeErrors("crawl function errors", err);
		console.error(
			colors.red(
				"Error with fetching the url content - please refer to the error file to see the error logs"
			)
		);
		return false;
	}
};

//----------------------initial call to crawl the urls-------------------------
const callCrawl = async () => {
	await connectDB();
	//include a list of urls here
	const urls = ["https://www.srilanka.travel/", "http://www.methma.tech/"];
	for (let url of urls) {
		crawl(url, true);
		console.log("dhnhjjvhjvhv");
	}
};
callCrawl();
