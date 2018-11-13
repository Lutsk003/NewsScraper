// Dependencies
const express = require("express");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const logger = require("morgan");

// scraping tools
const axios = require("axios");
const cheerio = require("cheerio");


// Models
const db = require("./models")

// Express
const app = express();

// Database
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperDB";

// Connect to Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Middleware/morgan logger for logging requests
app.use(logger("dev"));

// Parse request as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// make public folder static
app.use(express.static("public"));

// Routes
// Scrape from The Onion
app.get("/scrape", (req, res) => {
    axios.get("https://www.theonion.com/c/news-in-brief").then( (response) => {
        const $ = cheerio.load(response.data);

        $("h1.headline.entry-title").each( (i, element) => {
            var result = {};

            // Add text, href, and summary of headline
            result.title = $(this)
                .children("a")
                .children("div")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
                console.log(result.title)

            // Create new article with scraping object
            db.Article
                .create(result)
                .then( (dbArticle) => {
                    console.log(dbArticle);
                })
                .catch( (err) => {
                    res.json(err);
                });

        });
        res.send("scrape successful");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
});
  
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
// Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
            res.json(err);
        });
});
  
// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
// Create a new note and pass the req.body to the entry
db.Note.create(req.body)
    .then(function(dbNote) {
    // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
    // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
    // If we were able to successfully update an Article, send it back to the client
    res.json(dbArticle);
    })
    .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
    });
});

// delete articles
app.get("/delarticles", function(req, res) {
    // Remove every Article from the Articles collection
    db.Article.remove({}, function(error, response) {
      // Log any errors to the console
        if (error) {
            console.log(error);
            res.send(error);
        } else {
            console.log(response);
            res.send(response);
        }
    });
});

// Delete notes
app.get("/delnotes", function(req, res) {
    // Remove every Note from the Notes collection
    db.Note.remove({}, function(error, response) {
      // Log any errors to the console
        if (error) {
            console.log(error);
            res.send(error);
        } else {
            console.log(response);
            res.send(response);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
});
