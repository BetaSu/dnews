const mongo = require('mongodb').MongoClient;

const {initCollections} = require('./src/model');
const initApp = require('./src');
const {dbName, dbHost, dbPort} = require('./config.json');

(async() => {
  try {
    const db = await mongo.connect(`mongodb://${dbHost}:${dbPort}`, {useNewUrlParser: true});
    console.log('数据库连接成功。');
    await initCollections(db.db(dbName));
    initApp();
  } catch (e) {
    throw e;
  }
})();
