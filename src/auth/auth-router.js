const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter.route('/token').post(jsonBodyParser, async (req, res, next) => {
  const { username, password } = req.body;
  const user = { username, password };

  for (const [key, val] of user) {
    if (val === null) {
      return res.status(404).json({ error: `missing ${key} in request body` });
    }
  }
  try {
    const error = 'Incorrect username or password';
    const matchUser = await AuthService.getUserWithUserName(
      req.app.get('db'),
      username
    );
    if (!matchUser) {
      return res.status(404).json({ error });
    }
    const passwordOk = await AuthService.comparePasswords(
      password,
      matchUser.password
    );
    if (!passwordOk) {
      return res.status(404).json({ error });
    }
    const payload = {
      user_id: matchUser.id,
      name: matchUser.name ? matchUser.name : matchUser.username
    };
    res.send({
      authToken: AuthService.createJwt(username, payload)
    });
  } catch (e) {
    next(e);
  }
});
