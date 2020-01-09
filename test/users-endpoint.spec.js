const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const testJson = require('./testBookmarks.json');

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

  describe('GET /api/user/:user_id, gets all lists from user', () => {
    beforeEach('insert everything', () => helpers.seedTables(db, testUsers, testLists, testFolders, testBookmarks, testTags, userlist, listfolder, folderbookmarks, bookmarktag));
    it('returns list of all bookmarks in main list', () => {
      const expectedBooks = testBookmarks;
      return supertest(app)
        .get('/api/user/1/')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, expectedBooks);
    });
  });

  describe('POST /api/user/:user_id, add bookmarks', () => {
    beforeEach('insert everything', () => helpers.seedTables(db, testUsers, testLists, testFolders, testBookmarks, testTags, userlist, listfolder, folderbookmarks, bookmarktag));
    it('creates list of bookmarks, responds 201 and with new obj', () => {
      return supertest(app)
        .post('/api/user/1/')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(testJson)
        .expect(201)
        .expect(res => {
          expect(res).to.eql('hello');
        });
    });
  });
});