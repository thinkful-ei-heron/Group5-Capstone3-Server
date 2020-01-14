const express = require('express');
const AuthService = require('../auth/auth-service');
const UserService = require('./user-service');
const StorageService = require('../storage/storage-service');
const userRouter = express.Router();
const jsonBodyParser = express.json();

const authError = { error: 'Unauthorized request' };

//for getting list IDs or posting new users
userRouter
  .route('/:user_id/')
  .get(async (req, res, next) => {
    if (Number(req.params.user_id) !== req.user.id) {
      return res.status(401).json(authError);
    }
    try {
      const db = req.app.get('db');
      const userId = req.user.id;
      const listIds = await StorageService.getListIds(db, userId);
      res.json(listIds);
    } catch (e) {
      next(e);
    }
  })
  .post(jsonBodyParser, async (req, res, next) => {
    try {
      const bookmarksObj = req.body;
      if (Object.keys(bookmarksObj).length === 0) {
        return res.status(400).json({ error: 'Empty bookmarks file' });
      }
      const db = req.app.get('db');
      const name = bookmarksObj.name || 'Default';

      const id = await StorageService.insertStructuredList(
        db,
        bookmarksObj,
        name,
        req.user.id
      );
      res
        .status(201)
        .location(`${req.baseUrl}/${req.user.id}/${id}`)
        .send();
      next();
    } catch (error) {
      next(error);
    }
  });
  
//for adding or getting lists
userRouter
  .route('/:user_id/:list_id')
  .get(async (req, res, next) => {
    if (Number(req.params.user_id) !== req.user.id) {
      return res
        .status(404)
        .json({ error: `User has no list with id ${req.params.list_id}` });
    }
    try {
      const db = req.app.get('db');
      const userId = req.user.id;
      const requestedListId = Number(req.params.list_id);
      // check if list belongs to user
      const listIds = await StorageService.getListIds(db, userId);
      if (!listIds.includes(requestedListId)) {
        return res.status(401).json(authError);
      }
      const nodes = await StorageService.getStructuredList(db, requestedListId);
      nodes.list_id = requestedListId;
      res.json(nodes);
      next();
    } catch (error) {
      next(error);
    }
  })
  .put(jsonBodyParser, async (req, res, next) => {
    if (Number(req.params.user_id) !== req.user.id) {
      return res
        .status(404)
        .json({ error: `User has no list with id ${req.params.list_id}` });
    }
    try {
      const bookmarksObj = req.body;
      if (Object.keys(bookmarksObj).length === 0) {
        return res.status(400).json({ error: 'Empty bookmarks file' });
      }
      const db = req.app.get('db');

      const listName = req.body.name || 'default';

      await StorageService.insertStructuredList(
        db,
        bookmarksObj,
        listName,
        req.user.id,
        req.params.list_id
      );
      res.status(204).send();
      next();
    } catch (error) {
      next(error);
    }
  });

//for getting or patching settings
userRouter
  .route('/:user_id/settings')
  .get(async (req, res, next) => {
    if (Number(req.params.user_id) !== req.user.id) {
      return res
        .status(404)
        .json({ error: 'User ID matching error' });
    }
    try {
      const settings = await UserService.getSettings(
        req.app.get('db'),
        req.params.user_id
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

//for creating new users
userRouter
  .route('/')
  .post(jsonBodyParser, async (req, res, next) => {
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
        return res.status(400).json({ error: 'Username already exists' });
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
          return res.status(400).json({ error: 'email already exists' });
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

module.exports = userRouter;
