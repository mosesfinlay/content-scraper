const date = new Date();
const fancyDate = `${date.getFullYear()}-${date.getDate()}-${date.getMonth()+1}`

const scrape = require("website-scraper");

const options = {
  urls: ["http://shirts4mike.com/shirts.php"],
  directory: `../data/${fancyDate}`,
  sources: [
    { selector: "img", attr: "src" },
    { selector: "ul.products li a", attr: "href" }
  ],
  maxDepth: 1,
};

scrape(options, (error, result) => {
  console.error(error);
});
