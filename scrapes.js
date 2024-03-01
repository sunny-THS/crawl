const e = require('express');
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

async function scrapeComicsChapter(url) {
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

  try {
    const page = await browser.newPage();

    page.setRequestInterception(true);

    page.on('request', (request) => {
      if (blockRequest(request.url()) || request.resourceType() == "stylesheet") {
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

    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });
    await delay(3000);

    await page.waitForSelector('.child');

    console.timeEnd("goto");

  } catch (error) {
    console.log('error', error);
  } finally {
    browser.close();
  }
}

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
      if (blockRequest(request.url()) || request.resourceType() == "stylesheet") {
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

    await delay(2500);

    await page.waitForSelector('#divImage');

    await delay(2500);

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
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

/**
 * 
 * @param {puppeteer.Page} page 
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 400;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function scrollBottom(page) {
  await page.evaluate(async () => {
    window.scrollBy(0, document.body.scrollHeight);
  });
  await delay(3000);
}

async function scrapeSoundtrack(url) {
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
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector('#marked-article');

  const soundtrackInfo = await page.evaluate(() => {
    const links = document.querySelectorAll('#marked-article > a');
    const text = document.getElementById('marked-article');
    const listSoundtrack = Array.from(links).map(link => link.href);
    const textNodes = Array.from(text.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim());
    const value = []
    const regex = /[\[\]]/;
    const regex2 = /^\d+\./;

    for (const item of textNodes) {
      if (item != '' && regex.test(item) == false) {
        value.push(item)
      }
    }
    value.splice(0, 1)
    const soundtrackName = value.filter(item => !regex2.test(item))

    const dataSoundtrack = []

    for (let i = 0; i < listSoundtrack.length; i++) {
      const songName = soundtrackName[i].split(' – ')[0]
      const singleName = soundtrackName[i].split(' – ')[1]
      const temp = {
        soundtrackName: songName,
        soundtrackSingle: singleName ?? songName,
        soundtrackUrl: listSoundtrack[i]
      }
      dataSoundtrack.push(temp)
    }

    return dataSoundtrack;
  });

  // console.log(soundtrackInfo);
  await browser.close();
  return soundtrackInfo;
}

async function scrapeSoundtrackForShow(url) {
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
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector('#marked-article');

  const soundtrackInfo = await page.evaluate(() => {
    const links = document.querySelectorAll('#marked-article > a');
    const text = document.getElementById('marked-article');
    const listSoundtrack = Array.from(links).map(link => link.href);
    const textNodes = Array.from(text.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim());
    const value = []
    const regex = /[\]’]$/;
    const regex2 = /^\d+\./;

    for (const item of textNodes) {
      if (item != '' && item != '.' && regex.test(item) == false) {
        value.push(item)
      }
    }
    value.splice(0, 1)
    const soundtrackName = value.filter(item => !regex2.test(item))

    const dataSoundtrack = []
    for (let i = 0; i < listSoundtrack.length; i++) {
      const songName = soundtrackName[i].split(' – ')[0]
      const singleName = soundtrackName[i].split(' – ')[2] ? soundtrackName[i].split(' – ')[2] :soundtrackName[i].split(' – ')[1]
      const temp = {
        soundtrackName: songName,
        soundtrackSingle: singleName ?? songName,
        soundtrackUrl: listSoundtrack[i]
      }
      dataSoundtrack.push(temp)
    }

    
    // format list episode
    const episode = document.querySelectorAll('#marked-article > span');
    const episodeData = Array.from(episode).map(link => link.textContent);
    const listEpisode = [];
    const listEpisodeAdd = []
    for (let i = 0; i < episodeData.length; i++) {
      if (episodeData[i].endsWith('songs')) {
        const index = i + 1;
        //format release date
        const lines = episodeData[i].split('\n');
        const release_date = lines[2];
        const formatDate = release_date.split(" ");
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const date = formatDate[0] + "/" + ((months.indexOf(formatDate[1]) + 1) < 10 ? "0" + (months.indexOf(formatDate[1]) + 1) : (months.indexOf(formatDate[1]) + 1)) + "/" + formatDate[2]
        const [day, month, year] = date.split('/').map(item => parseInt(item));
        const dateObject = new Date(year, month - 1, day);
        const formattedDate = `${dateObject.getFullYear()}/${(dateObject.getMonth() + 1).toString().padStart(2, '0')}/${dateObject.getDate().toString().padStart(2, '0')} 00:00:00`;
        //format list episode
        let nameFormat;
        const startSingleQuoteIndex = episodeData[i].indexOf('‘');
        const endSingleQuoteIndex = episodeData[i].indexOf('’');
        const startParenthesisIndex = episodeData[i].indexOf('(');
        const endParenthesisIndex = episodeData[i].indexOf(')');

        if (startSingleQuoteIndex !== -1 && endSingleQuoteIndex !== -1) {
          nameFormat = episodeData[i].slice(startSingleQuoteIndex + 1, endSingleQuoteIndex);
        } else if (startParenthesisIndex !== -1 && endParenthesisIndex !== -1) {
          nameFormat = episodeData[i].slice(startParenthesisIndex + 1, endParenthesisIndex);
        } else {
          nameFormat = '';
        }

        const temp = {
          name: "E" + index + " | " + nameFormat,
          slug: nameFormat.toLowerCase().replace(/\s+/g, "-"),
          release_date: formattedDate,
          soundtrackCount: episodeData[i].match(/\d+(?= songs)/)[0]
        }
        const temp2 = {
          name: "E" + index + " | " +  nameFormat,
          slug: nameFormat.toLowerCase().replace(/\s+/g, "-"),
          release_date: formattedDate,
        }
        listEpisode.push(temp)
        listEpisodeAdd.push(temp2)
      }
    }
    return { dataSoundtrack, listEpisodeAdd, listEpisode };
  });

  await browser.close();
  return soundtrackInfo;
}

module.exports = {
  scrapeComics, scrapeComicsChapter, scrapeSoundtrack, scrapeSoundtrackForShow
}
