const puppeteer = require('puppeteer');
require("dotenv").config();
const wildcardMatch = require('wildcard-match');

const blockRequest = wildcardMatch(['*.css'], { separator: false });

const minimal_args = [
  '--disable-speech-api', // 	Disables the Web Speech API (both speech recognition and synthesis)
  '--disable-background-networking', // Disable several subsystems which run network requests in the background. This is for use 									  // when doing network performance testing to avoid noise in the measurements. ↪
  '--disable-background-timer-throttling', // Disable task throttling of timer tasks from background pages. ↪
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

const blocked_domains = [
  'googlesyndication.com',
  'adservice.google.com',
];

async function scrapeComics(url) {
  const browser = await puppeteer.launch({ 
    headless: process.env.NODE_ENV === "production",
    args: minimal_args,
    /*[
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],*/
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(), 
  });
  let imgs = [];

  try {  
    const page = await browser.newPage();

    page.setRequestInterception(true);

    page.on('request', (request) => {
      if (blockRequest(request.url()) || request.resourceType() == "stylesheet" ) {
        const u = request.url();
        console.log(`request to ${u.substring(0, 50)}...${u.substring(u.length - 5)} is aborted`);

        request.abort();

        return;
      }
      if (blocked_domains.some(domain => url.includes(domain))) {    
        request.abort();
        return;
      }

      request.continue();
    });

    console.time("goto");
    
    // await Promise.all([
    //   page.goto(`${url}&quality=hq&readtype=1`, {
    //     waitUntil: "domcontentloaded",
    //   }),
    //   page.waitForNetworkIdle({ idleTime: 250 }),
      
    // ]);

    await page.goto(`${url}&quality=hq&readtype=1`, {
      waitUntil: "domcontentloaded",
    });

    await delay(2000);

    await page.waitForSelector('#divImage');

    await delay(2000);

    await autoScroll(page);
    // await scrollBottom(page);
    // await scrollBottom(page);
    // await scrollBottom(page);
    console.timeEnd("goto");

    imgs = await page.$$eval('#divImage img[src]', imgs => imgs.map(img => img.getAttribute('src').split('?')[0]));
  } catch (error) {
    console.log('error', error);
  } finally {
    browser.close();
  }
  return imgs;
}

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

/**
 * 
 * @param {puppeteer.Page} page 
 */
async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve) => {
          var totalHeight = 0;
          var distance = 600;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight - window.innerHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}

async function scrollBottom(page){
  await page.evaluate(async () => {
    window.scrollBy(0, document.body.scrollHeight);
  });
  await delay(3000);
}

module.exports = {
  scrapeComics
}
