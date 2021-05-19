const fetch = require("node-fetch");
const colors = require("colors");
const cheerio = require("cheerio");
const fs = require("fs");

//ignore websites with given  urls
const isWebsiteValid = (subLink) => {
	let isSiteValid = true;
	const ignoreSites = [
		"https://www.youtube.com/",
		"https://www.google.com/",
		"https://www.facebook.com/",
	];

	for (ignoreSite of ignoreSites) {
		if (subLink.includes(ignoreSite)) {
			isSiteValid = false;
		}
	}

	return isSiteValid;
};

//find SubLinks in given websites
const findSubLinks = (body) => {
	const subLinks = body
		.find("a")
		.map((i, link) => link.attribs.href)
		.get();

	return subLinks.filter((subLink) => {
		if (subLink.includes("https://") && isWebsiteValid(subLink)) {
			return subLink.includes("https://");
		}
	});
};

//reading existing urls from the output
const existingUrls = () => {
	try {
		return fs.readFileSync(__dirname + "/files/output.txt", "utf8").split("\n");
	} catch (err) {
		writeErrors("existingUrls function errors", err);
		console.error(
			colors.red(
				"Error with reading existing urls - please refer to the error file to see the error logs"
			)
		);
	}
};

//compare with existing domains and ignore crawling for existing domain - maintain a file of unique domains
const compareDomains = (url) => {
	const eUrls = existingUrls();

	let isSameDomain = false;

	//sanitise the urls
	for (let eUrl of eUrls) {
		if (eUrl.includes("URL")) {
			eUrl = eUrl.slice(4);

			let existingDomain = new URL(eUrl);
			const existingFullDomain = "https://" + existingDomain.hostname + "/";

			let domain = new URL(url);
			const fullDomain = "https://" + domain.hostname + "/";

			if (existingFullDomain === fullDomain) {
				isSameDomain = true;
			}
		}
	}

	if (!isSameDomain) {
		return false;
	} else {
		return true;
	}
};

module.exports = { findSubLinks, compareDomains };
