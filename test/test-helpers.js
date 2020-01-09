const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 7)
  }));
  return db.into('users').insert(preppedUsers)
    .then( () => 
      db.raw('SELECT setval(\'users_id_seq\', ?)', [users[users.length-1].id])
    );
}

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      email: 'info1@email.com',
      password: 'password',
    },
    {
      id: 2,
      username: 'test-user-2',
      email: 'info2@email.com',
      password: 'password',
    },
    {
      id: 3,
      username: 'test-user-3',
      email: 'info3@email.com',
      password: 'password',
    },
    {
      id: 4,
      username: 'test-user-4',
      email: 'info4@email.com',
      password: 'password',
    },
  ];
}

function makeListsArray() {
  return [
    {
      id: 1,
      name: 'Main'
    }
  ];
}

function makeFoldersArray() {
  return [
    {
      id: 1,
      name: 'Sports',
      parent_folder_id: null
    },
    {
      id: 2,
      name: 'News',
      parent_folder_id: null
    },    {
      id: 3,
      name: 'Games',
      parent_folder_id: null
    }
  ];
}

function makeBookmarksArray() {
  return [
    {
      id: 1,
      name: 'ESPN',
      url: 'espn.com'
    },
    {
      id: 2,
      name: 'Bleacher Report',
      url: 'bleacherreport.com'
    },
    {
      id: 3,
      name: 'SI',
      url: 'si.com'
    },
    {
      id: 4,
      name: 'NYT',
      url: 'nytimes.com'
    },
    {
      id: 5,
      name: 'WaPo',
      url: 'washingtonpost.com'
    },
    {
      id: 6,
      name: 'CNN',
      url: 'cnn.com'
    },
    {
      id: 7,
      name: 'IGN',
      url: 'ign.com'
    },
    {
      id: 8,
      name: 'Polygon',
      url: 'polygon.com'
    },
    {
      id: 9,
      name: 'Kotaku',
      url: 'kotaku.com'
    }
  ];
}

function makeTagsArray() {
  return [
    {
      id: 1,
      tag: 'sport'
    },
    {
      id: 2,
      tag: 'new'
    },
    {
      id: 3,
      tag: 'game'
    }
  ];
}

function makeUserlist() {
  return [
    {
      user_id: 1,
      list_id: 1
    }
  ];
}

function makeListfolder() {
  return [
    {
      list_id: 1,
      folder_id: 1
    },
    {
      list_id: 1,
      folder_id: 2
    },
    {
      list_id: 1,
      folder_id: 3
    }
  ];
}

function makeFolderbookmarks() {
  return [
    {
      folder_id: 1,
      bookmark_id: 1
    },
    {
      folder_id: 1,
      bookmark_id: 2
    },
    {
      folder_id: 1,
      bookmark_id: 3
    },
    {
      folder_id: 1,
      bookmark_id: 4
    },
    {
      folder_id: 1,
      bookmark_id: 5
    },
    {
      folder_id: 1,
      bookmark_id: 6
    },
    {
      folder_id: 1,
      bookmark_id: 7
    },
    {
      folder_id: 1,
      bookmark_id: 8
    },
    {
      folder_id: 1,
      bookmark_id: 9
    }
  ];
}

function makeBookmarktag() {
  return [
    {
      bookmark_id: 1,
      tag_id: 1
    },
    {
      bookmark_id: 2,
      tag_id: 1
    },
    {
      bookmark_id: 3,
      tag_id: 1
    },
    {
      bookmark_id: 4,
      tag_id: 2
    },
    {
      bookmark_id: 5,
      tag_id: 2
    },
    {
      bookmark_id: 6,
      tag_id: 2
    },
    {
      bookmark_id: 7,
      tag_id: 3
    },
    {
      bookmark_id: 8,
      tag_id: 3
    },
    {
      bookmark_id: 9,
      tag_id: 3
    }
  ];
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      users,
      lists,
      folders,
      bookmarks,
      tags,
      userlist,
      listfolder,
      folderbookmarks,
      bookmarktag
      RESTART IDENTITY CASCADE`
  );
}

function seedTables(db, users, lists, folders, bookmarks, tags, userlist, listfolder, folderbookmarks, bookmarktag) {
  return db.transaction(async trx => {
    await seedUsers(db, users);
    await trx.into('lists').insert(lists);
    await trx.raw('SELECT setval(\'lists_id_seq\', ?)', [lists[lists.length-1].id]);
    await trx.into('folders').insert(folders);
    await trx.raw('SELECT setval(\'folders_id_seq\', ?)', [folders[folders.length-1].id]);
    await trx.into('bookmarks').insert(bookmarks);
    await trx.raw('SELECT setval(\'bookmarks_id_seq\', ?)', [bookmarks[bookmarks.length-1].id]);
    await trx.into('tags').insert(tags);
    await trx.raw('SELECT setval(\'tags_id_seq\', ?)', [tags[tags.length-1].id]);
    await trx.into('userlist').insert(userlist);
    // await trx.raw('SELECT setval(\'userlist_id_seq\', ?)', [userlist[userlist.length-1].id]);
    await trx.into('listfolder').insert(listfolder);
    // await trx.raw('SELECT setval(\'listfolder_id_seq\', ?)', [listfolder[listfolder.length-1].id]);
    await trx.into('folderbookmarks').insert(folderbookmarks);
    // await trx.raw('SELECT setval(\'folderbookmarks_id_seq\', ?)', [folderbookmarks[folderbookmarks.length-1].id]);
    await trx.into('bookmarktag').insert(bookmarktag);
    // await trx.raw('SELECT setval(\'bookmarktag_id_seq\', ?)', [bookmarktag[bookmarktag.length-1].id]);
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({user_id: user.id}, secret, {subject: user.username, algorithm: 'HS256'});
  return `Bearer ${token}`;
}
function makeFixtures() {
  const testUsers = makeUsersArray();
  const testLists = makeListsArray();
  const testFolders = makeFoldersArray();
  const testBookmarks = makeBookmarksArray();
  const testTags = makeTagsArray();
  const userlist = makeUserlist();
  const listfolder = makeListfolder();
  const folderbookmarks = makeFolderbookmarks();
  const bookmarktag = makeBookmarktag();
  return {testUsers, testLists, testFolders, testBookmarks, testTags, userlist, listfolder, folderbookmarks, bookmarktag};
}

module.exports = {
  seedUsers,
  makeUsersArray,
  makeListsArray,
  makeFoldersArray,
  makeBookmarksArray,
  makeTagsArray,
  makeUserlist,
  makeListfolder,
  makeFolderbookmarks,
  makeBookmarktag,
  cleanTables,
  seedTables,
  makeFixtures,
  makeAuthHeader
};