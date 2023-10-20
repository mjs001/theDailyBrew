import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import 'dotenv/config';
import { LocalStorage } from "node-localstorage";
global.localStorage = new LocalStorage('./scratch');
const app = express();
app.use(express.static("public"));
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

var currentPage = 1;
var keyword = "";
var pageSize = 13;
var sortBy = "relevancy";
var apiKey = process.env.API_TOKEN;
var category = "general";

var date = new Date();
var year = date.getFullYear();
var day = ("0" + date.getDate()).slice(-2);
var month = ("0" + (date.getMonth() + 1)).slice(-2);
var todaysDate = `${month}-${day}-${year}`;

app.get("/", async (req, res) => {
    var parsedDate = localStorage.getItem("date");
    var parsedStoredData = JSON.parse(localStorage.getItem("storedData"));
    if (parsedStoredData !== null && parsedDate === todaysDate) {
        res.render("index.ejs", {
            data: parsedStoredData
        });
    } else {
        try {
            var auth = {
                headers: { Authorization: `Bearer ${apiKey}` },
            };
            const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=${pageSize}&sortBy=${sortBy}&currentPage=${currentPage}`, auth);
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
            console.log(error);
            res.render("index.ejs", { error: error });
        }
    }
})

app.get("/search", (req, res) => {
    try {
        var auth = {
            headers: { Authorization: `Bearer ${apiKey}` },
        };
        const response = axios.get(`https://newsapi.org/v2/top-headlines?country=us&q=${keyword}&pageSize=${pageSize}&page=${page}`, auth);
        var data = response.data;
        res.render("index.ejs", { data: data });
    } catch (error) {
        console.log(response.data.error);
        res.render("index.ejs", { error: response.data.error });
    }

})

app.listen(port, () => {
    console.log("Server is listening on port:", port);
})
