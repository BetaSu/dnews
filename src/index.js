const puppeteer = require('puppeteer');

const {keyword, level} = require('../config.json');
const {getDataByKeyword} = require('./handle');

const init = async() => {
  const browser = await puppeteer.launch({
    headless: false
  });
  await getDataByKeyword({browser, keyword, level});
  console.log('                          ');
  console.log('    任  务  完  成      ');
  process.exit(0);
};

module.exports = init;
