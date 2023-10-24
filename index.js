import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import 'dotenv/config';
import { LocalStorage } from "node-localstorage";
import { rateLimit } from "express-rate-limit";
global.localStorage = new LocalStorage('./scratch');
const app = express();
const limiter = rateLimit({
  windowMs: 43200000, // 12 hours
    max: 50, // limit each IP to 50 requests per windowMs
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false,
});

app.use(express.static("public"));
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

var currentPage = 1;
var keyword = "";
var pageSize = 16;
var apiKey = process.env.API_TOKEN;
var category = "general";
var newCategory = "general";
var date = new Date();
var year = date.getFullYear();
var day = ("0" + date.getDate()).slice(-2);
var month = ("0" + (date.getMonth() + 1)).slice(-2);
var todaysDate = `${month}-${day}-${year}`;

app.get("/", async (req, res) => {
    var parsedDate = localStorage.getItem("date");
    var parsedStoredData = JSON.parse(localStorage.getItem("storedData"));
    if (parsedStoredData !== null && parsedDate === todaysDate && newCategory === category) {
        res.render("index.ejs", {
            data: parsedStoredData
        });
    } else {
        try {
            category = newCategory;
            var auth = {
                headers: { Authorization: `Bearer ${apiKey}` },
            };
            const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=${pageSize}&currentPage=${currentPage}`, auth);
            var data = response.data;
            var filteredData = data.articles.filter((article) => {
                return article.url !== 'https://removed.com' && article.url !== null && article.title !== null && article.description !== null && article.title !== '[Removed]';
            })
            filteredData = filteredData.map((article) => {
                if (article.title === null) {
                    article.title = "Title not available.";
                } else if (article.description === null) {
                    article.description = "Description not available.";
                } else if (article.urlToImage === null) {
                    article.urlToImage = "Photo not available."
                }
                article.description = article.description.replace(/(<([^>]+)>)/ig, '');
                return article;
            });
           while (filteredData.length > 10) {
                filteredData = filteredData.slice(0, -1);
            }

            localStorage.setItem("date", todaysDate);
            localStorage.setItem("storedData", JSON.stringify(filteredData));
            res.render("index.ejs", { data: filteredData });
        } catch (error) {
            res.render("index.ejs", { error: error });
        }
    }
})

app.post("/category", limiter, (req, res) => {
    newCategory = req.body.category;
    res.redirect("/");
})

app.listen(port, () => {
    console.log("Server is listening on port:", port);
})
