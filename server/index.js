const express = require('express');
const bodyParser = require('body-parser');
const monk = require('monk');
const dotenv = require('dotenv');
const scrapes = require('./scrapes');

dotenv.config();
const app = express();
const port = process.env.PORT;
const uri = process.env.MONGOURI;
const db = monk(uri);
const creators = db.get('creators');

app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", '*'); // disabled for security local
  res.header("Access-Control-Allow-Headers", 'Content-Type');
  next();
});

app.get('/', async(req, res) => {
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
      .then(created => console.log('add success'));
  }else {
    res.status(422);
    res.json({massage: "Error"})
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
