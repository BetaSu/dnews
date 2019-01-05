const puppeteer = require('puppeteer');

const {keyword, level} = require('../config.json');
const {getDataByKeyword} = require('./handle');

const init = async() => {
  const browser = await puppeteer.launch({
    headless: true
  });
  await getDataByKeyword({browser, keyword, level});
};

module.exports = init;
