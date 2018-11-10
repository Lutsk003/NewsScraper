// Scrape from The Onion
router.get("/scrape", (req, res) => {
    axios.get("https://www.theonion.com/").then( (response) => {
        const $ = cheerio.load(response.data);

        $("article").each( (i, element) => {
            var result = {};

            // Add text, href, and summary of headline
            result.title = $(this)
                .children("header")
                .children("h1")
                .text();
            result.link = $(this)
                .children("header")
                .children("h1")
                .children("a")
                .attr("href");
            result.summary = $(this)
                .children("div")
                .next().next()
                .children("div")
                .children("p")
                .text();

                console.log(result.summary)

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