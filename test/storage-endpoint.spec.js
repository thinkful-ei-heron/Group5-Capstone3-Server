const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const testJson = require('./testBookmarks.json');

describe('Storage endpoints, basic tests', function() {
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

  after('Disconnect from db', () => db.destroy());

  before('Cleanup', () => helpers.cleanTables(db));

  beforeEach('insert everything', () =>
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

  afterEach('Cleanup', () => helpers.cleanTables(db));

  describe('POST /api/list, add bookmarks', () => {
    it('creates list of bookmarks, responds 201 and id', () => {
      return supertest(app)
        .post('/api/list')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(testJson)
        .expect(201)
        .expect(res => {
          expect(res.body).to.eql({ id: 3 });
        });
    });
  });

  describe('PUT /api/list/:id, replace list', () => {
    it("With one of the user's lists, responds 204 No Content", () => {
      return supertest(app)
        .put('/api/list/1')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(testJson)
        .expect(204);
    });

    it('With a non-existing list, responds 404 Not Found', () => {
      return supertest(app)
        .put('/api/list/-1')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(testJson)
        .expect(404);
    });

    it('With a list that exists but does not belong to the user, responds 404 Not Found', () => {
      return supertest(app)
        .put('/api/list/2')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(testJson)
        .expect(404);
    });
  });
});

describe('Storage endpoints, persistence testing', function() {
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

  after('Disconnect from db', () => db.destroy());

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

  it('POST /api/list creates list of bookmarks, responds 201 and id', () => {
    return supertest(app)
      .post('/api/list')
      .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      .send(testJson)
      .expect(201)
      .expect(res => {
        expect(res.body).to.eql({ id: 3 });
      });
  });

  it('GET /api/user/lists reflects the new list', () => {
    return supertest(app)
      .get('/api/user/lists')
      .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      .expect(200)
      .expect(res =>
        expect(res.body).to.eql([
          {
            id: 1,
            name: 'Main'
          }, //list 2 belongs to a different user
          {
            id: 3,
            name: 'default'
          }
        ])
      );
  });

  it('GET /api/list/:id returns the new list', () => {
    return supertest(app)
      .get('/api/list/3')
      .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      .expect(200)
      .expect(res => compareLists(testJson, res));
  });

  it('PUT /api/list/:id returns 204 No Content', () => {
    const input = { ...testJson };
    input.contents = [input.contents[2]]; //trim a couple of folders
    return supertest(app)
      .put('/api/list/3')
      .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      .send(input)
      .expect(204);
  });

  it('GET /api/list/:id returns the updated list', () => {
    const input = { ...testJson };
    input.contents = [input.contents[2]]; //trim a couple of folders
    return supertest(app)
      .get('/api/list/3')
      .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      .expect(200)
      .expect(res => compareLists(input, res));
  });
});

function compareLists(input, response) {
  for (const key of Object.keys(response)) {
    if (key === 'contents') {
      if (!input.contents) return false;
      for (let i = 0; i < response.contents.length; i++) {
        if (!input.contents[i]) {
          return false;
        }
        const contentsMatch = compareLists(
          input.contents[i],
          response.contents[i]
        );
        if (!contentsMatch) return false;
      }
    } else if (key !== 'id' || !!input.id) {
      //don't care about id unless we provided one
      if (input[key] === response[key]) {
        //this is good
      } else if (input[key] === undefined && response[key] === null) {
        //also acceptable: null response keys are expected where input had nothing
      } else {
        //objects don't match at [key], and not because of undefined vs null
        return false;
      }
    }
  }
  //made it all the way through without encountering a problem
  return true;
}
