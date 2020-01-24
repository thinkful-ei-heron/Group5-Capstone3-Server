const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const jwt = require('jsonwebtoken');

describe('Users endpoints', function() {
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

  afterEach('Cleanup', () => helpers.cleanTables(db));
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

  describe('GET /api/user/lists, gets all lists from user', () => {
    it('returns list of all lists belonging to current user', () => {
      const expectedNodes = testNodes;
      return supertest(app)
        .get('/api/user/lists')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect(res =>
          expect(res.body).to.eql([
            {
              id: 1,
              name: 'Main'
            }
          ])
        );
    });
  });
  describe('POST /api/user, register user', () => {
    it('given a username and password, registers a new user and returns 201 with user info and auth token', () => {
      const usr = {
        id: 5,
        name: 'test',
        username: 'test'
      };
      return supertest(app)
        .post('/api/user')
        .send({
          username: 'test',
          password: '!p4ssw0rD'
        })
        .expect(201)
        .expect(res => {
          // console.log(res);
          const { id, name, username, authToken } = res.body;
          const token = jwt.decode(authToken);
          return (
            expect({ id, name, username }).to.eql(usr) &&
            expect(token.name).to.equal(name)
          );
        });
    });

    it('given an existing username and password, responds 400 with error message', () => {
      return supertest(app)
        .post('/api/user')
        .send({
          username: 'test-user-1',
          password: '!p4ssw0rD'
        })
        .expect(400)
        .expect(res =>
          expect(res.body).to.eql({ error: 'Username already exists' })
        );
    });

    it('given a common password, responds 400 and alerts client', () => {
      return supertest(app)
        .post('/api/user')
        .send({
          username: 'test-user-99',
          password: 'password1'
        })
        .expect(400)
        .expect(res =>
          expect(res.body).to.eql({
            error: 'Password includes password from disallowed list'
          })
        );
    });
  });
});
