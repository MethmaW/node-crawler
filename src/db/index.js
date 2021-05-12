const mongoose = require("mongoose");

const connectDB = () => {
	const uri = process.env.DB_URI;

	try {
		mongoose.connect(
			uri,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
			},
			() => console.log("🚀 Connected to MongoDB")
		);
	} catch (error) {
		console.log(error);
	}
};

module.exports = connectDB;
