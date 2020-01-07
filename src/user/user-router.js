const express = require('express');
const UserService = require('./user-service');

const userRouter = express.Router();
const jsonBodyParser = express.json();

userRouter.route('/user/:user_id')
  .get(async (req, res, next) => {
    try {
      const db = req.app.get('db');
      const userId = req.user.id;
      const listIds = await UserService.getListIds(db, userId);
      const folderIds = await UserService.getFolderIds(db, listIds);
      const bookmarkIds = await UserService.getBookmarkIds(db, folderIds);
      const lists = await UserService.getLists(db, listIds);
      const folders = await UserService.getFolders(db, folderIds);
      const bookmarks = await UserService.getBookmarks(db, bookmarkIds);
      
    } catch(error) {
      next(error);
    }
  });

module.exports = userRouter;
