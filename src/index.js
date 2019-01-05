const puppeteer = require('puppeteer');

const config = require('../config.json');
const {getDataByKeyword} = require('./handle');

const init = async() => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const {keywords} = config;
  for (let i = 0; i < keywords.length; i++) {
    const page = await browser.newPage();
    const curKey = keywords[i];
    await getDataByKeyword(page, curKey);
    await page.close();
  }
};

module.exports = init;
