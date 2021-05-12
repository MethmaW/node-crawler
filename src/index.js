const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const url = require("url");
const connectDB = require("./db/index");
const dotenv = require("dotenv");
const Location = require("./db/models/locations");

dotenv.config();
connectDB();

//use this function to create locations in db - for testing purposes only
const createNewLocations = () => {
	const locs = ["Sri Lanka", "Colombo", "United Kingdom", "London"];

	locs.map((l) => {
		const newLocation = new Location({
			location: l,
		});

		const saveLocation = newLocation.save();
	});
};

//keywords array
let keywords;

//locations array
let locations = [];

//all words in the body array
let bodyText = "";

//found locations array
let foundLocations = [];

//found keywords array
let foundKeyWords = [];

//keeping a track of link count
let linkCount = 0;

//keeping a track of already visited urls
const seenUrls = {};

//sanitising the urls
const getUrl = (link, host, protocol) => {
	if (link.includes("http")) {
		return link;
	} else if (link.startsWith("/")) {
		return `${protocol}//${host}${link}`;
	} else {
		return `${protocol}//${host}/${link}`;
	}
};

//crawling function to serach for locations and keywords
const crawl = async ({ url, ignore }) => {
	if (seenUrls[url]) return;
	seenUrls[url] = true;
	linkCount += 1;
	console.log("url", url);
	console.log("linkCount", linkCount);

	foundKeyWords.length = 0;
	foundLocations.length = 0;
	bodyText.length = 0;

	//fetching html from the given url
	const response = await fetch(url);
	const html = await response.text();

	//loading html
	const $ = cheerio.load(html);

	const myURL = new URL(url);
	const host = myURL.host;
	const protocol = myURL.protocol;

	//getting body read only text
	const getBody = $("body p, h1, h2, h3, h4, h5, h6").each((i, e) => {
		const item = $(e).text();
		//console.log("item", item);
		bodyText = bodyText + " " + item;
	});

	//creating arry from found locations
	const findLocations = locations.some((l) => {
		//console.log("l", l);
		bodyText.includes(l) && foundLocations.push(l);
	});

	//creating array from frond key words
	const findKeyWords = keywords.some((k) => {
		//console.log("k", k);
		bodyText.includes(k) && foundKeyWords.push(k);
	});

	//global logs
	console.log("keywords", keywords);
	console.log("locations", locations);
	console.log("bodyText", bodyText);
	console.log("foundLocations", foundLocations);
	console.log("foundKeyWords", foundKeyWords);

	//write files
	const writeOutput = () => {
		const content =
			"\n" +
			"URL: " +
			url.toString() +
			"\n" +
			"Keywords: " +
			foundKeyWords.toString() +
			"\n" +
			"Locations mentioned: " +
			foundLocations.toString() +
			"\n" +
			"\n" +
			"==============================================" +
			"\n";

		fs.appendFileSync(
			__dirname + "/files/Output.txt",
			content,
			"UTF-8",
			{ flags: "a+" },
			(err) => {
				if (err) {
					console.error(err);
					return;
				}
			}
		);
	};

	if (foundLocations.length > 0 || foundKeyWords.length > 0) writeOutput();

	//accessing sublinks via a tags
	const links = $("a")
		.map((i, link) => link.attribs.href)
		.get();

	links
		.filter((link) => link.includes(host) && !link.includes(ignore))
		.forEach((link) => {
			if (linkCount <= 5) {
				crawl({
					url: getUrl(link, host, protocol),
					ignore,
				});
			}
		});
};

//calling the crawl function with the initial url
const initialLinkCrwal = (initialU) => {
	if (linkCount === 0) {
		crawl({
			url: initialU,
			ignore: "/search",
		});
	}
};

//reading keywords from the text file
const readKeyWords = () => {
	const kWords = fs
		.readFileSync(__dirname + "/files/keywords.txt", "utf8")
		.split("\n");
	keywords = kWords;

	if (keywords.length !== 0) {
		initialLinkCrwal("https://www.srilanka.travel/");
	}
};

//fetching all the locations from db
const getLocations = async () => {
	const allLocations = await Location.find({});
	allLocations.forEach((l) => {
		locations.push(l.location);
	});

	if (allLocations) {
		readKeyWords();
	}
};
getLocations();
