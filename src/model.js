const mongo = require('mongodb').MongoClient;
const {dbName, dbHost, dbPort} = require('../config.json');

let curDB;
let repeatCount = 0;

const NEWS_COLLECTION_NAME = 'news';

const initDB = async() => {
  try {
    const db = await mongo.connect(`mongodb://${dbHost}:${dbPort}`, {useNewUrlParser: true});
    curDB = db.db(dbName);
  } catch (e) {
    throw e;
  }
};

const initCollections = async() => {
  if (!curDB) return;
  await curDB.createCollection(NEWS_COLLECTION_NAME);
  return curDB.collection(NEWS_COLLECTION_NAME);
};

const insertData = async data => {
  const exist = await curDB.collection(NEWS_COLLECTION_NAME).findOne({title: data.title});
  if (exist) {
    return console.log('重复数据', ++repeatCount);
  }
  await curDB.collection(NEWS_COLLECTION_NAME).insertOne(data);
  console.log('爬取：', data.title);
};

module.exports = {
  initDB,
  initCollections,
  insertData
};
