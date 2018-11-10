// Dependencies
var express = require("express");
var router = express.Router();

// models
var db = require("../models");

// Grabbing notes from DB
router.get("/notes", (req, res) => {
    db.Note
        .find({})
        .then( (dbNote) => {
            res.json(dbNote);
        })
        .catch( (err) => {
            res.json(err);
        });
});

// Grabbing articles from DB
router.get("/articles", (req, res) => {
    db.Article
        .find({}).populate("note")
        .then( (dbArticle) => {
            res.json(dbArticle);
        })
        .catch( (err) => {
            res.json(err);
        });
});

// Delete articles
router.delete("/articles/deleteAll", (req, res) => {
    db.Article.remove({})
        .then( (err) => {
            res.json(err);
        })
});

// Grab specific article by ID and note
router.get("/articles/:id", (req, res) => {
    db.Article
        .findOne({ _id: req.params.id })
        .populate("note")
        .then( (dbArticle) => {
            res.json(dbArticle);
        })
        .catch( (err) => {
            res.json(err);
        });
});

// Saving and updating article notes
router.post("/articles/:id", (req, res) => {
    db.Note
        .create(req.body)
        .then( (dbNote) => {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $addToSet: { note: dbNote._id }}, { new: true });
        })
        .then( (dbArticle) => {
            res.json(dbArticle);
        })
        .catch( (err) => {
            res.json(err);
        });
});

// Deleting notes
router.delete("/notes/deleteNote/:note_id/:article_id", (req, res) => {
    db.Note.findOneAndRemove({ _id: req.params.note_id }, (err) => {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            db.Article.findOneAndUpdate({ _id: req.params.article_id }, { $pull: {note: req.params.note_id }})
                .exec( (err, data) => {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.send(data);
                    }
                });
        }
    });
});

// Saving articles
router.post("/saved/:id", (req, res) => {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true }})
        .then( (dbArticle) => {
            res.json(dbArticle);
        });
});

// Grabbing all saved articles
router.get("/saved", (req, res) => {
    db.Article.find({ saved: true }).populate("note")
        .then( (dbArticle) => {
            res.json(dbArticle);
        })
        .catch( (err) => {
            res.json(err);
        });
});

// Delete a saved article
router.post("/deleteSaved/:id", (req, res) => {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: false }})
        .then( (dbArticle) => {
            res.json(dbArticle);
        })
        .catch( (err) => {
            res.json(err);
        });
});

module.exports = router;