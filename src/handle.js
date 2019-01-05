const {insertData} = require('./model');

const getOnePageData = async(page, keyword) => {
  const data = await page.$$eval('#content_left .result', resultList => {
    function parseItem(el) {
      const $el = $(el);
      const $tle = $el.find('.c-title a');
      const url = $tle.attr('href');
      const title = $tle.text().trim();
      const summaryStr = $el.find('.c-summary').text() || '';
      const summaryArr = summaryStr.split(/\n/).join('').replace(/ {2,}/g, '').split(/\s{2,}/);
      const author = summaryArr[0] || '';
      const date = summaryArr[1] || '';
      const summary = summaryArr[2] || '';
      return {url, title, author, date, summary};
    }
    return resultList.map(el => parseItem(el));
  });

  await Promise.all(data.map(async item => {
    item.keyword = keyword;
    await insertData(item);
  }));
  return data.length;
};

const toNextPage = async page => {
  const btns = await page.$$('#page .n');
  for (let i = 0; i < btns.length; i++) {
    const curBtn = btns[i];
    const innerTextJH = await curBtn.getProperty('innerText');
    if (innerTextJH.toString().includes('下一页')) {
      await Promise.all([
        curBtn.click(),
        page.waitForNavigation({
          waitUntil: 'domcontentloaded'
        })
      ]);
      return true;
    }
  }
  return false;
};

const getDataByKeyword = async(page, keyword) => {
  let dataLen = 0;
  let pageLen = 0;
  await page.goto(`http://news.baidu.com/ns?word=${encodeURIComponent(keyword)}&tn=news&from=news&cl=2&rn=20&ct=1`);
  dataLen += await getOnePageData(page, keyword);
  while (await toNextPage(page)) {
    pageLen++;
    dataLen += await getOnePageData(page, keyword);
  }
  console.log(`获取${keyword}数据完成，共爬取${pageLen}页，获取${dataLen}条。`);
};

module.exports = {
  getOnePageData,
  toNextPage,
  getDataByKeyword
};
