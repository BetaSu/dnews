let curDB;

const NEWS_COLLECTION_NAME = 'news';

const initCollections = async db => {
  curDB = db;
  await db.createCollection(NEWS_COLLECTION_NAME);
};

const insertData = async data => {
  const exist = await curDB.collection(NEWS_COLLECTION_NAME).findOne({title: data.title});
  if (exist) return;
  await curDB.collection(NEWS_COLLECTION_NAME).insertOne(data);
  // console.log('爬取：', data.title);
};

module.exports = {
  initCollections,
  insertData
};
