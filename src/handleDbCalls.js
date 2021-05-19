const colors = require("colors");
const Location = require("./db/models/locations");
const { writeErrors } = require("./fileHandling");

// //get the locations in the database
const getLocations = async () => {
	try {
		const allLocations = await Location.find({});
		return allLocations.map((locationObject) => {
			return locationObject.location;
		});
	} catch (err) {
		writeErrors("getLocations function errors", err);
		console.error(
			colors.red(
				"Error fetching locations from the db - please refer to the error file to see the error logs"
			)
		);
	}
};

module.exports = { getLocations };
