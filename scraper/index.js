const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const async = require("async");
const path = require("path");

axios.get("https://www.berlin.de/umweltatlas/").then((response) => {
    const body = response.data;
    const $ = cheerio.load(body);

    $("article .inner .more");
    // loop throught this and only get the link like so $(el).attr("href");
    // then push it to an array
    // then loop through the array and make a request for each link
    // then get the data from each link and save it to a file
    const sachenGruppen = [];
    $("article .inner .more").each((i, el) => {
        const link = $(el).attr("href");
        sachenGruppen.push(link);
    });

    // const sachenGruppen = $("article .inner .more").map((i, el) => {
    //     return $(el).attr("href");
    // });

    console.log("sachenGruppen", sachenGruppen);
});

