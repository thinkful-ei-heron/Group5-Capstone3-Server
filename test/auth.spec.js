const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const jwt = require('jsonwebtoken');

describe('Auth functionality', function() {
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

  describe('POST /api/auth/token, login endpoint', () => {
    it('Given good input, returns 200 and an auth token', () => {
      return supertest(app)
        .post('/api/auth/token')
        .send({
          username: 'test-user-1',
          password: 'password'
        })
        .expect(200)
        .expect(res => {
          const { authToken } = res.body;
          const token = jwt.decode(authToken);
          return expect(token.name).to.equal('test-user-1');
        });
    });
    it('Given a bad username, returns 404 and error message', () => {
      return supertest(app)
        .post('/api/auth/token')
        .send({
          username: 'wrong',
          password: 'password'
        })
        .expect(404)
        .expect(res =>
          expect(res.body).to.eql({
            error: 'Incorrect username or password'
          })
        );
    });
    it('Given a bad password, returns 404 and error message', () => {
      return supertest(app)
        .post('/api/auth/token')
        .send({
          username: 'test-user-1',
          password: 'wrong'
        })
        .expect(404)
        .expect(res =>
          expect(res.body).to.eql({
            error: 'Incorrect username or password'
          })
        );
    });
  });

  describe('PUT /api/auth/token, token refresh', () => {
    it('Given a valid token, returns 200 and an updated token', () => {
      const usr = testUsers[0];
      return supertest(app)
        .put('/api/auth/token')
        .set('Authorization', helpers.makeAuthHeader(usr))
        .expect(200)
        .expect(res => {
          const token = jwt.decode(res.body.authToken);
          return expect(token.name).to.equal(usr.username);
        });
    });
    it('Given a bad token, returns 401 Unauthorized', () => {
      const usr = testUsers[0];
      let header = helpers.makeAuthHeader(usr);
      header = header + 'garbage';
      return supertest(app)
        .put('/api/auth/token')
        .set('Authorization', header)
        .expect(401);
    });
  });
});
