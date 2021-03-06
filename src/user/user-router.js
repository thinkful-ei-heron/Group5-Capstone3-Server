const express = require('express');
const AuthService = require('../auth/auth-service');
const UserService = require('./user-service');
const StorageService = require('../storage/storage-service');
const userRouter = express.Router();
const jsonBodyParser = express.json();

const authError = { error: 'Unauthorized request' };

//for creating new users
userRouter.route('/').post(jsonBodyParser, async (req, res, next) => {
  const { password, username, name, email } = req.body;
  for (const field of ['password', 'username']) {
    if (!req.body[field]) {
      return res
        .status(400)
        .json({ error: `missing ${field} in request body` });
    }
  }
  try {
    const db = req.app.get('db');
    const passwordError = UserService.validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }
    const isUsernameTaken = await UserService.hasUserWithUserName(db, username);
    if (isUsernameTaken) {
      return res.status(400).json({ error: 'Username already exists.' });
    }
    const hash = await UserService.hashPassword(password);
    const newUser = { username, password: hash };
    newUser.name = name ? name : null;
    if (email) {
      if (!UserService.validateEmail(email)) {
        return res.status(400).json({ error: 'invalid email' });
      }
      const isEmailTaken = await UserService.hasUserWithEmail(db, email);
      if (isEmailTaken) {
        return res.status(400).json({ error: 'Email already exists.' });
      }
      newUser.email = email;
    }

    const user = await UserService.insertUser(db, newUser);
    const jwt = AuthService.createJwt(user.username, {
      user_id: user.id,
      name: user.name ? user.name : user.username
    });

    res.status(201).json({
      id: user.id,
      name: user.name ? user.name : user.username,
      username: user.username,
      authToken: jwt
    });
  } catch (e) {
    next(e);
  }
});

//for getting list info
userRouter.route('/lists').get(async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;
    const listIds = await StorageService.getListIds(db, userId);
    let lists = await StorageService.getLists(db, listIds);
    lists = lists.map(list => {
      const { id, name } = list;
      return { id, name };
    });
    res.json(lists);
  } catch (e) {
    next(e);
  }
});

//for getting or patching settings
userRouter
  .route('/settings')
  .get(async (req, res, next) => {
    try {
      const settings = await UserService.getSettings(
        req.app.get('db'),
        req.user.id
      );
      res.json(settings);
    } catch (e) {
      next(e);
    }
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { preview, extra, autosave, color } = req.body;
    const settings = { preview, extra, autosave, color };
    const id = req.user.id;
    UserService.patchSettings(req.app.get('db'), id, settings)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = userRouter;
