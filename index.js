const express = require('express');
const bodyParser = require('body-parser');
const { scrapeComics } = require('./scrapes');
const request = require('request');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('client'));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", '*'); // disabled for security local
  res.header("Access-Control-Allow-Headers", 'Content-Type');
  next();
});

app.get('/crawl-comics', async(req, res) => {
  console.log('url', req.query.url);
  let chapter_images = await scrapeComics(req.query.url);
  let fail = chapter_images.filter((chap) => chap == "/Content/images/blank.gif").length;
  let success = chapter_images.length - fail;

  if (fail == 0) {
    const options = {
      url: 'https://blackdog.vip/api/storage_chapter',
      'method': 'POST',
      'headers': {
        'Content-Type': 'reqapplication/jsonuest'
      },
      'body': JSON.stringify({
        "images": chapter_images,
        "comic_name": req.query.comic_name,
        "chapter_name": req.query.chapter_name
      })
    }
  
    request(options, function(error, response, body){
      if (error) {
        console.log('Upload: fail');
        console.log('error: ', error);
      } else {
        console.log('Upload: success');
      }
    });
    console.log(chapter_images);
  }
  res.json({
    message: `Result:\n
    Total: ${chapter_images.length}\n
    Success: ${success}\n
    Fail: ${fail}`,
    chapter_images
  })
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
