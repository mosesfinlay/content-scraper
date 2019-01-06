const date = new Date();

// Creates a nicely formatted date
const fancyDate = `${date.getFullYear()}-${date.getDate()}-${date.getMonth()+1}`;

let shirtLinks = [];

// CSV creator module variables
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: `../data/${fancyDate}.csv`,
  header: [
    { id: "title", title: "Title" },
    { id: "price", title: "Price" },
    { id: "image_url", title: "ImageURL" },
    { id: "url", title: "URL" },
    { id: "time", title: "Time" },
  ]
});
let shirtData = [];

// Requires the crawler module
const Crawler = require("crawler");

// Displays an error message
function errorMessage(error) {
  console.error(`An error has occurred. Please try again. (${error.message})`);
}

// Scrapes the website for the links to each shirt
function getShirtLinks(error, response, done) {
  // Handles any errors
  if (error) {
    errorMessage(error);
  } else {
    const $ = response.$;

    // Adds the shirt links to to shirtLinks array
    $("ul.products li a").each((index, item) => {
      shirtLinks.push(`http://shirts4mike.com/${$(item).attr("href")}`);
    });

    // Runs the getShirtInfo scraper for each of the shirts
    getShirtInfoCrawler.queue(shirtLinks);
  }
  done();
}

// Scrapes information like the title, price, image_url etc.
const getShirtInfoCrawler = new Crawler({
  maxConnections: 10,
  callback: (error, response, done) => {
    // Handles any errors
    if (error) {
      errorMessage(error)
    } else {
      const $ = response.$;
      // Image url for the current shirt
      const imageURL = $("div.shirt-picture span img").attr("src");

      // Adds the shirt info to the CSV writer
      shirtData.push({
        title: $("head title").text(),
        price: $("div.shirt-details h1 span").text(),
        image_url: `http://shirts4mike.com/${imageURL}`,
        url: shirtLinks[imageURL.substring(19, 20)-1],
        time: `${fancyDate}`,
      });

      // When the shirtInfo array has all of the shirt information
      if (shirtData.length === shirtLinks.length) {

        // Write the CSV file
        csvWriter.writeRecords(shirtData)
          .then(() => console.log("Finished"))
          .catch(error => errorMessage);
      }
    }
    done();
  }
});

// Goes to the website and gets the links to each shirt
const getShirtLinksCrawler = new Crawler({
  maxConnections: 10,
  callback: (error, response, done) => getShirtLinks(error, response, done),
});

// Runs the getShirtLinks scraper
getShirtLinksCrawler.queue("http://shirts4mike.com/shirts.php");
