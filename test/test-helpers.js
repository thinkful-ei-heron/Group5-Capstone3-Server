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

function makeNodesArray() {
  return [
    {
      id: 1,
<<<<<<< HEAD
      title: 'Sports',
      last_modified: null,
      ns_root: null,
      type: 'folder',
      icon: null,
      url: null
    },
    {
      id: 2,
      title: 'News',
      last_modified: null,
      ns_root: null,
      type: 'folder',
      icon: null,
      url: null
    },    
    {
      id: 3,
      title: 'Games',
      last_modified: null,
      ns_root: null,
      type: 'folder',
      icon: null,
      url: null
    },
=======
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
>>>>>>> develop
    {
      id: 4,
      title: 'ESPN',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'espn.com'
    },
    {
      id: 5,
      title: 'Bleacher Report',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,

      url: 'bleacherreport.com'
    },
    {
      id: 6,
      title: 'SI',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'si.com'
    },
    {
      id: 7,
      title: 'NYT',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'nytimes.com'
    },
    {
      id: 8,
      title: 'WaPo',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'washingtonpost.com'
    },
    {
      id: 9,
      title: 'CNN',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'cnn.com'
    },
    {
      id: 10,
      title: 'IGN',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,

      url: 'ign.com'
    },
    {
      id: 11,
      title: 'Polygon',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'polygon.com'
    },
    {
      id: 12,
      title: 'Kotaku',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
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

function makeListnode() {
  return [
    {
      list_id: 1,
      node_id: 1
    },
    {
      list_id: 1,
      node_id: 2
    },
    {
      list_id: 1,
      node_id: 3
    },
    {
      list_id: 1,
      node_id: 4
    },    
    {
      list_id: 1,
      node_id: 5
    },    
    {
      list_id: 1,
      node_id: 6
    },    
    {
      list_id: 1,
      node_id: 7
    },    
    {
      list_id: 1,
      node_id: 8
    },    {
      list_id: 1,
      node_id: 9
    },    
    {
      list_id: 1,
      node_id: 10
    },
    {
      list_id: 1,
      node_id: 11
    },
    {
      list_id: 1,
      node_id: 12
    }
  ];
}


function makeNodetag() {
  return [
    {
      node_id: 4,
      tag_id: 1
    },
    {
      node_id: 5,
      tag_id: 1
    },
    {
      node_id: 6,
      tag_id: 1
    },
    {
      node_id: 7,
      tag_id: 2
    },
    {
      node_id: 8,
      tag_id: 2
    },
    {
      node_id: 9,
      tag_id: 2
    },
    {
      node_id: 10,
      tag_id: 3
    },
    {
      node_id: 11,
      tag_id: 3
    },
    {
      node_id: 12,
      tag_id: 3
    }
  ];
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      users,
      lists,
      nodes,
      tags,
      userlist,
      listnode,
      nodetag
      RESTART IDENTITY CASCADE`
  );
}

function seedTables(db, users, lists, nodes, tags, userlist, listnode, nodetag) {
  return db.transaction(async trx => {
    await seedUsers(db, users);
    await trx.into('lists').insert(lists);
    await trx.raw('SELECT setval(\'lists_id_seq\', ?)', [lists[lists.length-1].id]);
    await trx.into('nodes').insert(nodes);
    await trx.raw('SELECT setval(\'nodes_id_seq\', ?)', [nodes[nodes.length-1].id]);
    await trx.into('tags').insert(tags);
    await trx.raw('SELECT setval(\'tags_id_seq\', ?)', [tags[tags.length-1].id]);
    await trx.into('userlist').insert(userlist);
    // await trx.raw('SELECT setval(\'userlist_id_seq\', ?)', [userlist[userlist.length-1].id]);
    await trx.into('listnode').insert(listnode);
    // await trx.raw('SELECT setval(\'listfolder_id_seq\', ?)', [listfolder[listfolder.length-1].id]);
    await trx.into('nodetag').insert(nodetag);
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
  const testNodes = makeNodesArray();
  const testTags = makeTagsArray();
  const userlist = makeUserlist();
  const listnode = makeListnode();
  const nodetag = makeNodetag();
  return {testUsers, testLists, testNodes, testTags, userlist, listnode, nodetag};
}

module.exports = {
  seedUsers,
  makeUsersArray,
  makeListsArray,
  makeNodesArray,
  makeTagsArray,
  makeUserlist,
  makeListnode,
  makeNodetag,
  cleanTables,
  seedTables,
  makeFixtures,
  makeAuthHeader
};