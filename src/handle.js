const {insertData} = require('./model');

const getOnePageData = async({page, keyword}) => {
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

const getRelateSearch = async({page}) => {
  return await page.$$eval('#rs a', list => {
    return list.map(a => {
      const $el = $(a);
      return {
        url: $el.attr('href'),
        content: $el.text()
      };
    });
  });
};

const toNextPage = async({page}) => {
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

const initFirstPage = async({browser, keyword}) => {
  const page = await browser.newPage();
  const url = `http://news.baidu.com/ns?word=${encodeURIComponent(keyword)}&tn=news&from=news&cl=2&rn=20&ct=1`;
  await page.goto(url);
  const relate = await getRelateSearch({page});
  return {
    page,
    relate
  };
};

const getDataByKeyword = async({browser, keyword, level, curLevel}) => {
  curLevel = curLevel || 1;
  if (curLevel > level) return;
  const {page, relate} = await initFirstPage({browser, keyword});
  let dataLen = 0;
  let pageLen = 0;

  dataLen += await getOnePageData({page, keyword});
  while (await toNextPage({page})) {
    pageLen++;
    dataLen += await getOnePageData({page, keyword});
  }
  await page.close();
  console.log(`>-------------完成层级：${curLevel}，关键词：${keyword}，页数：${pageLen}，条数：${dataLen}`);
  for (const relateItem of relate) {
    const {content} = relateItem;
    await getDataByKeyword({browser, keyword: content, level, curLevel: curLevel + 1});
  }
};

module.exports = {
  getOnePageData,
  toNextPage,
  getDataByKeyword,
  getRelateSearch
};
