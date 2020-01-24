const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 7)
  }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      db.raw("SELECT setval('users_id_seq', ?)", [users[users.length - 1].id])
    );
}

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      email: 'info1@email.com',
      password: 'password'
    },
    {
      id: 2,
      username: 'test-user-2',
      email: 'info2@email.com',
      password: 'password'
    },
    {
      id: 3,
      username: 'test-user-3',
      email: 'info3@email.com',
      password: 'password'
    },
    {
      id: 4,
      username: 'test-user-4',
      email: 'info4@email.com',
      password: 'password'
    }
  ];
}

function makeListsArray() {
  return [
    {
      id: 1,
      name: 'Main'
    },
    {
      id: 2,
      name: 'Main'
    }
  ];
}

function makeNodesArray() {
  return [
    {
      id: '7ed0b8d2-c88a-4174-960b-cdd001bacb8a',
      title: 'Sports',
      last_modified: null,
      ns_root: null,
      type: 'folder',
      icon: null,
      url: null
    },
    {
      id: 'a3381982-1478-4fb7-a1a9-bfee0bede171',
      title: 'News',
      last_modified: null,
      ns_root: null,
      type: 'folder',
      icon: null,
      url: null
    },
    {
      id: '23f321e6-0cfc-453e-9984-ae1588598b59',
      title: 'Games',
      last_modified: null,
      ns_root: null,
      type: 'folder',
      icon: null,
      url: null
    },
    {
      id: '607507b2-8e80-4a1a-b056-b3b1d0b26ce2',
      title: 'ESPN',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'espn.com'
    },
    {
      id: '776ab22e-d09c-4cff-9e06-d59550ea3435',
      title: 'Bleacher Report',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,

      url: 'bleacherreport.com'
    },
    {
      id: '2df9e033-7028-49df-b1d2-6ba713d5f015',
      title: 'SI',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'si.com'
    },
    {
      id: 'ba0cec9e-c07d-4e0f-9b39-cb2ef3cf8aa7',
      title: 'NYT',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'nytimes.com'
    },
    {
      id: '575d6749-c0dc-4ffa-90e2-5ebf0387d9fe',
      title: 'WaPo',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'washingtonpost.com'
    },
    {
      id: '070af9f1-2f12-4a00-a10a-4d09402556a2',
      title: 'CNN',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'cnn.com'
    },
    {
      id: '6d993079-b470-42da-a8eb-a4ec95e300b3',
      title: 'IGN',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,

      url: 'ign.com'
    },
    {
      id: '9e44aead-ed6a-4902-88ad-2352ceb24c58',
      title: 'Polygon',
      last_modified: null,
      ns_root: null,
      type: 'bookmark',
      icon: null,
      url: 'polygon.com'
    },
    {
      id: '34bb82e4-b1d5-4d26-9c4d-a02d3a6bf97d',
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
    },
    {
      user_id: 2,
      list_id: 2
    }
  ];
}

function makeListnode() {
  return [
    {
      list_id: 1,
      node_id: '7ed0b8d2-c88a-4174-960b-cdd001bacb8a'
    },
    {
      list_id: 1,
      node_id: 'a3381982-1478-4fb7-a1a9-bfee0bede171'
    },
    {
      list_id: 1,
      node_id: '23f321e6-0cfc-453e-9984-ae1588598b59'
    },
    {
      list_id: 1,
      node_id: '607507b2-8e80-4a1a-b056-b3b1d0b26ce2'
    },
    {
      list_id: 1,
      node_id: '776ab22e-d09c-4cff-9e06-d59550ea3435'
    },
    {
      list_id: 1,
      node_id: '2df9e033-7028-49df-b1d2-6ba713d5f015'
    },
    {
      list_id: 1,
      node_id: 'ba0cec9e-c07d-4e0f-9b39-cb2ef3cf8aa7'
    },
    {
      list_id: 1,
      node_id: '575d6749-c0dc-4ffa-90e2-5ebf0387d9fe'
    },
    {
      list_id: 1,
      node_id: '070af9f1-2f12-4a00-a10a-4d09402556a2'
    },
    {
      list_id: 1,
      node_id: '6d993079-b470-42da-a8eb-a4ec95e300b3'
    },
    {
      list_id: 1,
      node_id: '9e44aead-ed6a-4902-88ad-2352ceb24c58'
    },
    {
      list_id: 1,
      node_id: '34bb82e4-b1d5-4d26-9c4d-a02d3a6bf97d'
    }
  ];
}

function makeNodetag() {
  return [
    {
      node_id: '607507b2-8e80-4a1a-b056-b3b1d0b26ce2',
      tag_id: 1
    },
    {
      node_id: '776ab22e-d09c-4cff-9e06-d59550ea3435',
      tag_id: 1
    },
    {
      node_id: '2df9e033-7028-49df-b1d2-6ba713d5f015',
      tag_id: 1
    },
    {
      node_id: 'ba0cec9e-c07d-4e0f-9b39-cb2ef3cf8aa7',
      tag_id: 2
    },
    {
      node_id: '575d6749-c0dc-4ffa-90e2-5ebf0387d9fe',
      tag_id: 2
    },
    {
      node_id: '070af9f1-2f12-4a00-a10a-4d09402556a2',
      tag_id: 2
    },
    {
      node_id: '6d993079-b470-42da-a8eb-a4ec95e300b3',
      tag_id: 3
    },
    {
      node_id: '9e44aead-ed6a-4902-88ad-2352ceb24c58',
      tag_id: 3
    },
    {
      node_id: '34bb82e4-b1d5-4d26-9c4d-a02d3a6bf97d',
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

function seedTables(
  db,
  users,
  lists,
  nodes,
  tags,
  userlist,
  listnode,
  nodetag
) {
  return db.transaction(async trx => {
    await seedUsers(db, users);
    await trx.into('lists').insert(lists);
    await trx.raw("SELECT setval('lists_id_seq', ?)", [
      lists[lists.length - 1].id
    ]);
    await trx.into('nodes').insert(nodes);
    await trx.into('tags').insert(tags);
    await trx.raw("SELECT setval('tags_id_seq', ?)", [
      tags[tags.length - 1].id
    ]);
    await trx.into('userlist').insert(userlist);
    // await trx.raw('SELECT setval(\'userlist_id_seq\', ?)', [userlist[userlist.length-1].id]);
    await trx.into('listnode').insert(listnode);
    // await trx.raw('SELECT setval(\'listfolder_id_seq\', ?)', [listfolder[listfolder.length-1].id]);
    await trx.into('nodetag').insert(nodetag);
    // await trx.raw('SELECT setval(\'bookmarktag_id_seq\', ?)', [bookmarktag[bookmarktag.length-1].id]);
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256'
  });
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
  return {
    testUsers,
    testLists,
    testNodes,
    testTags,
    userlist,
    listnode,
    nodetag
  };
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
