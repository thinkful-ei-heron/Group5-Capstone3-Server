const express = require('express');
const AuthService = require('../auth/auth-service');
const UserService = require('./user-service');

const userRouter = express.Router();
const jsonBodyParser = express.json();

const authError = { error: 'Unauthorized request' };

userRouter.route('/:user_id/').get(async (req, res, next) => {
  if (Number(req.params.user_id) !== req.user.id) {
    return res.status(401).json(authError);
  }
  try {
    const db = req.app.get('db');
    const userId = req.user.id;
    const listIds = await UserService.getListIds(db, userId);
    res.json(listIds);
  } catch (e) {
    next(e);
  }
});

userRouter.route('/:user_id/:list_id').get(async (req, res, next) => {
  if (Number(req.params.user_id) !== req.user.id) {
    return res.status(401).json(authError);
  }
  try {
    const db = req.app.get('db');
    const userId = req.user.id;
    const requestedListId = Number(req.params.list_id);
    // check if list belongs to user
    const listIds = await UserService.getListIds(db, userId);
    if (!listIds.includes(requestedListId)) {
      return res.status(401).json(authError);
    }
    const nodes = await UserService.createStructure(db, requestedListId);
    res.json(nodes);
    next();
  } catch (error) {
    next(error);
  }
});

userRouter.route('/:user_id/').post(jsonBodyParser, async (req, res, next) => {
  const nodesArray = [];
  try {
    console.log(req.body);
    const bookmarksObj = req.body;
    console.log(bookmarksObj);
    if (Object.keys(bookmarksObj).length === 0) {
      return res.status(400).json({ error: 'Empty bookmarks file' });
    }
    // let nodes = bookmarksObj.bookmarks;
    // console.log(nodes);
    const db = req.app.get('db');
    // const list = await UserService.insertListSimple(db);
    // const list_id = list.id;
    // await UserService.insertNodesSimple(db, nodes);
    // await UserService.insertUserlistSimple(db, req.params.user_id, list_id);
    // for (let node of nodes) {
    //   const node_id = node.id;
    //   await UserService.insertListnodeSimple(db, list_id, node_id);
    // }
    // res.status(201).json(nodes);

    const id = await UserService.insertStructuredList(
      db,
      bookmarksObj,
      'default'
    );
    res
      .status(201)
      .location(`${req.baseUrl}/${id}`)
      .send();
    next();
  } catch (error) {
    next(error);
  }
});

// userRouter
//   .route('/:user_id/')
//   .post(jsonBodyParser, async (req, res, next) => {
//     const bookmarkArray = [];
//     try {
//       const bookmarksObj = req.body;
//       const bookmarks = bookmarksObj.roots.bookmark_bar.children[0].children;
//       if (Object.keys(bookmarksObj).length === 0){
//         return res.status(400).json({error: 'Empty bookmarks file'});
//       }
//       const db = req.app.get('db');
//       await UserService.insertListSimple(db)
//         .then(list => {
//           const list_id = list.id;
//           //for each child of roots, which would be a folder
//           //but for now assuming just one folder
//           const folderName = Object.keys(bookmarksObj.roots)[0];
//           UserService.insertFolderSimple(db, folderName, null)
//             .then(folder => {
//               console.log('folder:', folder);
//               const folder_id = folder[0].id;
//               UserService.insertListfolderSimple(db, list_id, folder_id)
//                 .then( () => {
//                   for (let bookmark of bookmarks){
//                     const bookmark_id = bookmark.id;
//                     UserService.insertBookmarkSimple(db, bookmark)
//                       .then( () => {
//                         UserService.insertFolderbookmarkSimple(db, folder_id, bookmark_id);
//                       });
//                   }
//                   console.log('bookmarkArray:', bookmarkArray);
//                   res.status(201).json(bookmarks);
//                   next();
//                 });
//             });
//         });
//     } catch(error) {
//       next(error);
//     }
//   });

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
