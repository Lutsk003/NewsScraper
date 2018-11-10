// Dependencies
var express = require("express");
var router = express.Router();

// Scraping
var axios = require("axios");
var cheerio = require("cheerio");

// models
var db = require("../models");

// Scraping from the onion
router.get("/scrape", function(req, res) {
    // Get the entire body of the html with a request.
    axios.get("https://www.theonion.com/c/news-in-brief")
    .then(function(response) {
        // Load the response into cheerio and save it as a short-hand selector "$"
        var $ = cheerio.load(response.data);

        // Get every h1 within an article tag...
        $("article").each(function(i, element) {
            // Save an empty result object
            var result = {};
            console.log(result);
            // Get the text and href of every link, save them as properties of the result object.
            result.headline = $(this).find("h1.headline").text();
            result.link = $(this).find("h1.headline").children("a").attr("href");
            result.summary = $(this).find("div.excerpt").children("p").text();
            result.image = $(this).find("picture").children("source").attr("data-srcset");

            // Create a new Article with the `result` object built from scraping.
            db.Article.create(result)
            .then(function(dbArticle) {
                // View the added result in the console:
                   console.log(dbArticle);
            })
            .catch(function(error) {
                // Send the error, if it exists.
                return res.json(error);
            });
        });

        // Alert the client if the scrape was completed:
        res.send("Scrape was successful!");
    });
});

// Get all Articles from the db.
router.get("/", (req, res) => {
    db.Article.find({}).limit(20)
    .then( (scrapedArticle) => {
        const newObj = { articles:scrapedArticle };
        console.log(newObj);
        res.render("index", newObj);
    })
    .catch( (err) => {
        res.json(err);
    });
});

// Save an Article.
router.put("/saved/:id", (req, res) => {
    db.Article.update(
        { _id: req.params.id },
        { saved: true }
    )
    .then( (result) => {
        res.json(result);
    })
    .catch( (err) => {
        res.json(err);
    });
});

// Drop articles
router.delete("/drop-articles", function(req, res, next) {
    db.Article.remove({}, function(err) {
        if (err) {
            console.log(err)
        } else {
            console.log("articles dropped!");
        }
    })
    .then( (drop) => {
        db.Note.remove({}, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log("notes dropped!");
            }
        })
    })
});

module.exports = router;