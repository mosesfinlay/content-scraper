const date = new Date();
const fancyDate = `${date.getFullYear()}-${date.getDate()}-${date.getMonth()+1}`;

let shirtLinks = [];

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
const Crawler = require("crawler");

function errorMessage(error) {
  console.error(`An error has occurred. Please try again. (${error.message})`);
}
function getShirtLinks(error, response, done) {
  if (error) {
    errorMessage(error)
  } else {
    const $ = response.$;

    $("ul.products li a").each((index, item) => {
      shirtLinks.push(`http://shirts4mike.com/${$(item).attr("href")}`);
    });

    getShirtInfoCrawler.queue(shirtLinks);
  }
  done();
}
let records = [];
const getShirtInfoCrawler = new Crawler({
  maxConnections: 10,
  callback: (error, response, done) => {
    if (error) {
      errorMessage(error)
    } else {
      const $ = response.$;

      const imageURL = $("div.shirt-picture span img").attr("src");

      records.push({
        title: $("head title").text(),
        price: $("div.shirt-details h1 span").text(),
        image_url: `http://shirts4mike.com/${imageURL}`,
        url: shirtLinks[imageURL.substring(19, 20)-1],
        time: `${fancyDate}`,
      });

      if (records.length === shirtLinks.length) {
        csvWriter.writeRecords(records)
          .then(() => console.log("Finished"))
          .catch(error => errorMessage);
      }
    }
    done();
  }
});

const getShirtLinksCrawler = new Crawler({
  maxConnections: 10,
  callback: (error, response, done) => getShirtLinks(error, response, done),
});
getShirtLinksCrawler.queue("http://shirts4mike.com/shirts.php");
