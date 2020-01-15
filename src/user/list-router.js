const express = require('express');
const StorageService = require('../storage/storage-service');
const listRouter = express.Router();
const jsonBodyParser = express.json({ limit: '10mb' });

//for adding or getting lists
listRouter.route('/').post(jsonBodyParser, async (req, res, next) => {
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
      .location(`${req.baseUrl}/${id}`)
      .json({ id });
    next();
  } catch (error) {
    next(error);
  }
});

listRouter
  .route('/:list_id')
  .get(async (req, res, next) => {
    try {
      const db = req.app.get('db');
      const userId = req.user.id;
      const requestedListId = Number(req.params.list_id);
      // check if list belongs to user
      const listIds = await StorageService.getListIds(db, userId);
      if (!listIds.includes(requestedListId)) {
        return res
          .status(404)
          .json({ error: `User has no list with id ${req.params.list_id}` });
      }
      const nodes = await StorageService.getStructuredList(db, requestedListId);
      res.json(nodes);
      next();
    } catch (error) {
      next(error);
    }
  })
  .put(jsonBodyParser, async (req, res, next) => {
    try {
      const bookmarksObj = req.body;
      if (Object.keys(bookmarksObj).length === 0) {
        return res.status(400).json({ error: 'Empty bookmarks file' });
      }
      const db = req.app.get('db');
      const requestedListId = Number(req.params.list_id);
      const userId = req.user.id;
      // check if list belongs to user
      const listIds = await StorageService.getListIds(db, userId);
      if (!listIds.includes(requestedListId)) {
        return res
          .status(404)
          .json({ error: `User has no list with id ${req.params.list_id}` });
      }
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
module.exports = listRouter;
