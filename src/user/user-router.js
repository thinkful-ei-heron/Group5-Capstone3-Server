const express = require('express');
const AuthService = require('../auth/auth-service');
const UserService = require('./user-service');

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter.post('/', jsonBodyParser, async (req, res, next) => {
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
      //todo: validate email
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
