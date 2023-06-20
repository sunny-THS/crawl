const puppeteer = require('puppeteer');
require("dotenv").config();

async function scrapeChannel(url) {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox'],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(), 
  });
  const page = await browser.newPage();
  
  await Promise.all([
    page.goto(`${url}&quality=hq&readtype=1`, {
      waitUntil: "domcontentloaded",
    }),
    page.waitForNetworkIdle({ idleTime: 250 }),
  ]);
  

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
