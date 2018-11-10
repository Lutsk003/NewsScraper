// Dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const logger = require("morgan");



// Models

var db = require("./models")

// Database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperDB";
// Connect to Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

const app = express();

// morgan logger for logging requests

app.use(logger("dev"));

// Parse request as JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// make public folder static
app.use(express.static("public"));

// Handlebars
// Connecting handlebars to express app
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Import routes
const scrapeRoutes = require("./controllers/controller.js");
const savedRoutes = require("./controllers/savedItems.js");
app.use(scrapeRoutes, savedRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
});
