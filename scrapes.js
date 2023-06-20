const puppeteer = require('puppeteer');

async function scrapeChannel(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`${url}&quality=hq&readtype=1`, {
    waitUntil: "Finish",
  })
  .catch((err) => console.log("error loading url", err));
  console.timeEnd("goto");

  const images = await page.$$('#divImage image');
  const images_url = [];
  for (let index = 0; index < images.length; index++) {
    images_url.push(await images[index].getProperty('src'));
  }
  console.log(images_url);
  browser.close();
  return images_url;
}

module.exports = {
  scrapeChannel
}
