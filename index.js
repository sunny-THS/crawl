const express = require('express');
const bodyParser = require('body-parser');
const { scrapeChannel } = require('./scrapes');

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
  console.log(req.params.url);
  let chapter_images = await scrapeChannel(req.query.url);
  console.log(chapter_images);
  res.json({
    message: 'Hello'
  })
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
