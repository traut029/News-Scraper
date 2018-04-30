var express = require("express");
var bodyParser = require("body-parser");
// var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/news-scraper");

//Use handlebars with a layout file of "main"
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Render handlebars main page
app.get("/", function (req, res) {
    var hbsObject = {
        userData: "data"
    };
    console.log(hbsObject);
    res.render("index", hbsObject);
});

// A GET route for scraping the NY Times website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    request("https://www.nytimes.com/", function (error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article.story").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            var title = $(element).children(".story-heading").text();
            var link = $(element).children(".story-heading").children().attr("href");
            var summary = $(element).children("p.summary").text();

            result.title = title;
            result.link = link;
            result.summary = summary;

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console

                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });

        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});
// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client

            var hbsObject = {
                articles: dbArticle
            }
            res.render("articles", hbsObject);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});
// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    console.log(req.params.id)
    db.Article.find({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("notes")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            console.log(dbArticle)
            res.status(200).json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});
// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    console.log("POST RAN!")
    console.log("req.body value:")
    console.log(req.body)
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            console.log("var dbNote._id value:")
            console.log(dbNote._id)
            console.log("req.body.body value:")
            console.log(req.body.body)
            console.log("req.params.id value:")
            console.log(req.params.id)
            return db.Article.findOneAndUpdate({ _id: req.params.id },  { $push:{ notes: dbNote._id }}, { new: true });
        })
        .then(function (dbArticle) {
            console.log("POST RAN THEN FUNCTION!")
            // If we were able to successfully update an Article, send it back to the client
            console.log("dbArticle")
            console.log(dbArticle)
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err)
            res.json(err);
            
        });
});
app.delete("/note/:id", function (req, res) {
    console.log("delete route req.params:")
    console.log(req.params.id)
    db.Note.deleteOne({_id:req.params.id})
    .then(function(data){
        console.log(data)
        res.json(data)
    })
})
app.delete("/article/:id", function (req, res) {
    console.log("delete route req.params:")
    console.log(req.params.id)
    db.Article.deleteOne({_id:req.params.id})
    .then(function(data){
        console.log(data)
        res.json(data)
    })
})
// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
