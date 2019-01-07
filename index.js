const {initDB, initCollections} = require('./src/model');
const initApp = require('./src');

(async() => {
  await initDB();
  await initCollections();
  await initApp();
})();
