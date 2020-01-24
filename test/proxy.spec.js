const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Proxy functionality', function() {
  this.timeout(5000);
  let db;
  const {
    testUsers,
    testLists,
    testNodes,
    testTags,
    userlist,
    listnode,
    nodetag
  } = helpers.makeFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  before('Cleanup', () => helpers.cleanTables(db));

  before('insert everything', () =>
    helpers.seedTables(
      db,
      testUsers,
      testLists,
      testNodes,
      testTags,
      userlist,
      listnode,
      nodetag
    )
  );

  after('Cleanup', () => helpers.cleanTables(db));

  after('Disconnect from db', () => db.destroy());

  describe('GET /api/proxy/wayback, Wayback Machine info', () => {
    it('Given a URL to look for, responds with information about snapshots stored by the wayback machine', () => {
      return supertest(app)
        .get('/api/proxy/wayback?target=https%3A%2F%2Fgoogle.com')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect(res => {
          const { url, archived_snapshots } = res.body;
          return (
            expect(url).to.equal('google.com') &&
            expect(archived_snapshots.closest.available).to.equal(true)
          );
        });
    });
  });

  describe('GET /api/proxy/memento, Memento Project info', () => {
    it('Given a URL to look for, responds with information about snapshots stored by all Memento-compatable archives', () => {
      return supertest(app)
        .get('/api/proxy/memento?target=https%3A%2F%2Fgoogle.com')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect(res => {
          const { original_uri, memento_info } = res.body;
          //there should be plenty of results for google, make sure of a couple
          const hasWaybackInfo = memento_info.some(
            archive => archive.archive_id === 'ia'
          );
          const hasWebciteInfo = memento_info.some(
            archive => archive.archive_id === 'webcite'
          );
          return (
            hasWaybackInfo &&
            hasWebciteInfo &&
            expect(original_uri).to.equal('http://google.com')
          );
        });
    });
  });
});
