const express = require('express');
const bodyParser = require('body-parser');
const monk = require('monk');
const scrapes = require('./scrapes');

const app = express();
const port = process.env.PORT || 3000;
const uri = 'mongodb+srv://admin:15853456@scraping.bwncg.mongodb.net/scraping?retryWrites=true&w=majority';
const db = monk(uri);
const creators = db.get('creators');
creators.options.castIds = false;
console.log(creators.options.castIds);
app.use(express.static('client'));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", '*'); // disabled for security local
  res.header("Access-Control-Allow-Headers", 'Content-Type');
  next();
});

app.get('/app', async(req, res) => {
  res.json({
    message: 'Hello'
  })
});

app.get('/creators', async(req, res) => {
  creators
    .find()
    .then(creator => {
      res.send(creator); // get from db
    })
});

app.get('/RemoveAll', async(req, res) =>{
  creators.remove();
});

function isValid(val) {
  return val.channelURL && val.channelURL.toString().trim() !== '';
}
app.post('/creators', async(req, res) => {
  if (isValid(req.body)) {
    console.log(req.body.channelURL);
    const channelData = await scrapes.scrapeChannel(req.body.channelURL);
    console.log(channelData);
    creators
      .insert(channelData)
      .then(creator => {
        res.send(creator);
      });
  }else {
    res.status(422);
    res.json({massage: "Error"})
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
