//dependencies
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

//heroku deployment
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

const PORT = process.env.PORT || 3000;

//defines the app
const app = express();

app.use(logger("dev"));

// Parse application body as JSON
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));
//connects to the online database
mongoose.connect(MONGODB_URI);
//connects to the local database
mongoose.connect("mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false,
});

// Import routes and give the server access to them.
app.use(require("./routes/api.js"));
// Start our server so that it can begin listening to client requests.
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
