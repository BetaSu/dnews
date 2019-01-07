const fs = require('fs');

const nodejieba = require('nodejieba');
const {initDB, initCollections} = require('../model');
nodejieba.insertWord('瑞幸咖啡');
nodejieba.insertWord('luckin coffee');
nodejieba.insertWord('盒马鲜生');
nodejieba.insertWord('36kr');

async function output(data) {
  const path = `./output/${Date.now()}.js`;
  const stream = fs.createWriteStream(path);
  stream.once('open', function(fd) {
    const str = 'const output = ' + JSON.stringify(data);
    stream.write(str);
    stream.end();
    console.warn('输出完成');
    process.exit(0);
  });
}

(async() => {
  await initDB();
  const newsCollection = await initCollections();
  // await showKeyWeight(newsCollection, 'summary', 50);
  // const result = await showKeyWeight(newsCollection, 'summary', 500);
  const result = await newsCollection.find({}, {_id: 0}).toArray();
  const a = result.filter(({date}) => date.includes('2019年01月03日')).map(({title}) => title).join('');
  output(nodejieba.extract(a, 10));
})();

function getStamp(word) {
  return Date.parse(word.replace(/[年|月|日]/g, '/'));
}

/**
 * 展示某个字段权重
 * @param {Collection} collection
 * @param {String} key 字段名
 * @param {Number} weight 权重
 */
const showKeyWeight = async(collection, key, weight) => {
  const projection = {_id: 0};
  projection[key] = 1;
  const all = await collection.find({}, {projection}).toArray();
  if (['author', 'date'].includes(key)) {
    const map = {};
    all.forEach(data => {
      const curKey = data[key].split(/\s/)[0];
      map[curKey] = map[curKey] ? map[curKey] + 1 : 1;
    });
    return Object.keys(map).map(word => {
      return {
        word,
        weight: map[word]
      };
    }).sort((a, b) => {
      if (key === 'date') {
        return getStamp(b.word) - getStamp(a.word);
      }
      return b.weight - a.weight;
    }).slice(0, weight);
  }
  const str = all.map(item => item[key].replace(/[百度快照|查看|相关新闻]/g, '')).join(' ');
  return nodejieba.extract(str, weight);
};
