const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
	location: { type: String, required: true },
	date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Location", locationSchema);
