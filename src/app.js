require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { excludePaths } = require('./middleware/exclude-paths');
const { requireAuth } = require('./middleware/jwt-auth');
const authRouter = require('./auth/auth-router');
const userRouter = require('./user/user-router');
const listRouter = require('./user/list-router');
const proxyRouter = require('./proxy/proxy-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

const corsOption = {
  origin: ['https://bookmark-organizer.now.sh', 'http://localhost:3000']
};

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors(corsOption));

const noAuthPaths = [
  {
    path: '/api/auth/token', // login
    method: 'POST'
  },
  {
    path: '/api/user', // register
    method: 'POST'
  }
];

//require auth by default
app.use(excludePaths(noAuthPaths, requireAuth));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/list', listRouter);
app.use('/api/proxy', proxyRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
