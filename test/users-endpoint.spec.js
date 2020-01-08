const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users endpoints', function() {
  this.timeout(5000);
  let db;
  const {testUsers, testLists, testFolders, testBookmarks, testTags, userlist, listfolder, folderbookmarks, bookmarktag} = helpers.makeFixtures();
  
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('Disconnect from db', () => db.destroy());

  before('Cleanup', () => helpers.cleanTables(db));

  afterEach('Cleanup', () => helpers.cleanTables(db));

  describe('GET /api/user/, gets all lists from user', () => {
    
  });
});