const bcrypt = require('bcryptjs');
const passwordChecker = require('password-checker');
const emailValidator = require('email-validator');
const checker = new passwordChecker();

checker.requireLetters(true);
checker.requireNumbersOrSymbols(true);
checker.min_length = 8;
checker.max_length = 72; //bcrypt
//disallow params:
//active
//in_password (true to disallow passwords that contain a disallowed entry at all, default off)
//len (min length of match if in_password is on, default 4 for password list, 0 otherwise)
//disallowed lists are case-insensitive
checker.disallowNames(true);
checker.disallowWords(true);
checker.disallowPasswords(true, true, 4);

const UserService = {
  getListIds(db, user_id) {
    console.log('getListIds');
    return db
      .pluck('list_id')
      .from('userlist')
      .where('user_id', user_id);
  },
  getNodeIds(db, list_id) {
    console.log('getNodeIds');
    return db
      .pluck('node_id')
      .from('listnode')
      .whereIn('list_id', list_id);
  },
  getNodes(db, node_ids) {
    console.log('getNodes');
    return db.from('nodes').whereIn('id', node_ids);
  },
  getLists(db, list_ids) {
    console.log('getLists');
    return db.from('lists').whereIn('id', list_ids);
  },
  getNodesFromList(db, list_id) {
    return db('listnode')
      .where({ list_id })
      .join('nodes', 'nodes.id', '=', 'listnode.node_id')
      .select(
        'nodes.id as id',
        'nodes.add_date as add_date',
        'nodes.last_modified as last_modified',
        'nodes.ns_root as ns_root',
        'nodes.title as title',
        'nodes.type as type',
        'nodes.icon as icon',
        'nodes.url as url',
        'listnode.next_node as next_node',
        'listnode.first_child as first_child'
      );
  },

  async serializeList(db, list_id) {
    //for now only worry about flat lists of bookmarks
    const nodes = await this.getNodesFromList(db, list_id);
    const bookmarks = {
      bookmarks: {
        ns_root: 'toolbar',
        title: 'Bookmarks bar',
        type: 'folder',
        children: []
      }
    };
    //TODO update DB to include first node on the lists object
    //in the meantime, work around it with hashmaps
    //this only works for flat structures, need a direct way to find first node to generalize

    //iterate through array once to build hashset of ids pointed to by next_node
    //and hashmap of node ids to nodes (this buys us O(n) performance instead of O(n^2))
    //with a flat structure there should be exactly one node not pointed to, which is the head
    //follow the trail of pointers and add nodes to the list in order
    let seen = new Set();
    let nodeObj = {};
    for (const node of nodes) {
      seen.add(node.next_node);
      nodeObj[node.id] = node;
    }
    const first = [...nodes].filter(node => !seen.has(node.id));
    if (first.length !== 1) {
      throw new Error('bookmark structure corrupted');
    }
    let cur = first[0];
    while (cur) {
      bookmarks.bookmarks.children.push(cur);
      cur = nodeObj[cur.next_node];
    }
    //TODO: santize bookmarks
    return JSON.stringify(bookmarks);
  },

  async createStructure(db, list_id) {
    const nodes = await this.getNodesFromList(db, list_id);
    const [first_node_id] = await db('lists')
      .pluck('head')
      .where('id', list_id);
    //initialize with root folder
    const nodeObj = {
      0: {
        name: '',
        id: 0,
        contents: []
      }
    };
    const folders = new Set();
    folders.add(0);
    for (const node of nodes) {
      nodeObj[node.id] = node;
      if (node.first_child) {
        folders.add(node.id);
        node.contents = [];
      }
    }
    folders.forEach(folderId => {
      console.log(folderId);
      const contents = [];
      let firstId = folderId ? nodeObj[folderId].first_child : first_node_id;
      let first = nodeObj[firstId];
      let cur = first;

      while (cur) {
        contents.push(cur);
        cur = nodeObj[cur.next_node];
      }
      console.log(contents);
      nodeObj[folderId].contents = contents;
    });

    for (const node of nodes) {
      delete node.first_child;
      delete node.next_node;
    }

    return nodeObj[0];
  },

  // async makeBookmarkStructure(db, list_id) {
  //   const folderStructure = await this.mapFolderStructureForList(db, list_id);
  //   const bookmarks = await this.getBookmarksWithParents(db, list_id);
  //   this.addBookmarksToFolders(folderStructure, bookmarks);
  //   return folderStructure;
  // },
  // async mapFolderStructureForList(db, list_id) {
  //   const folderIds = await db
  //     .pluck('folder_id')
  //     .from('listfolder')
  //     .where({ folder_id });
  //   const folders = await db
  //     .select('*') //id, parent_id, name
  //     .from('folders')
  //     .whereIn('id', folderIds);

  //   const folderStructure = this.makeFolderStructure(folders);
  // },
  // async getBookmarksWithParents(db, list_id) {
  //   const folderIds = await this.getFolderIds(db, list_id);
  //   const folders = await this.getFolders(db, folderIds);
  //   return await folders.map(async folder => {
  //     const bookmarkIdsInFolder = await this.getBookmarkIds(db, [folder]);
  //     const bookmarks = await this.getBookmarks(
  //       db,
  //       bookmarkIdsInFolder
  //     ).map(bookmark => ({ ...bookmark, folder_id: folder.id }));
  //     return bookmarks;
  //   });
  // },
  // makeFolderStructure(folders) {
  //   //array of folders
  //   const subfolders = {};
  //   for (const folder of folders) {
  //     const parentId = folder.parent_id;
  //     if (!subfolders[parentId]) {
  //       subfolders[parentId] = [];
  //     }
  //     subfolders[parentId].push(folder);
  //   }
  //   //subfolders is an object with keys that are parent IDs and values that are arrays of all subfolders
  //   for (let folder of folders) {
  //     folder.contents = subfolders[folder.id] || [];
  //   }
  //   const rootFolder = {
  //     name: '',
  //     id: 0,
  //     contents: []
  //   };
  //   rootFolder.contents = subfolders[0];
  //   return rootFolder;
  // },

  // addBookmarksToFolders(folderStructure, bookmarkArray) {
  //   //should modify in place
  //   const bookmarksByFolder = {};
  //   for (const bookmark of bookmarkArray) {
  //     const folderId = bookmark.folder_id;
  //     if (!bookmarksByFolder[folderId]) {
  //       bookmarksByFolder[folderId] = [];
  //     }
  //     bookmarksByFolder[folderId].push(bookmark);
  //   }
  //   recursiveAdd(folderStructure, bookmarksByFolder);
  // },

  // recursiveAdd(folder, foo) {
  //   //should modify in place
  //   for (const subfolder of folder.contents) {
  //     recursiveAdd(subfolder, foo);
  //   }
  //   folder.contents = folder.contents.concat(foo[folder.id]);
  // },

  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  hasUserWitEmail(db, email) {
    return db('users')
      .where({ email })
      .first()
      .then(user => !!user);
  },

  insertUser(db, newUser) {
    return db('users')
      .insert(newUser)
      .returning('*')
      .then(([user]) => user);
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  validateEmail(email) {
    return emailValidator.validate(email);
  },

  validatePassword(password) {
    if (checker.check(password)) {
      return null;
    }
    let err = checker.errors;
    return err[0].toString().slice(7);
    //err is array of failed rules, entries are error objects, toString gets 'Error: description of error'
  },
  //insert into list
  //insert into userlist
  //insert into folder
  //insert into listfolder
  //insert into bookmarks
  //insert into folderbookmarks

  insertListSimple(db) {
    return db
      .insert({ name: 'main' })
      .into('lists')
      .returning('*')
      .then(([list]) => list);
  },
  insertUserlistSimple(db, user_id, list_id) {
    return db
      .insert({ user_id, list_id })
      .into('userlist')
      .returning('*');
  },
  insertNodesSimple(db, node) {
    return db
      .insert(node)
      .into('nodes')
      .returning('*');
  },
  insertListnodeSimple(db, list_id, node_id) {
    return db
      .insert({ list_id, node_id })
      .into('listnode')
      .returning('*');
  },
  insertTagSimple(db, tag) {
    return db
      .insert({ tag })
      .into('tags')
      .returning('*');
  },
  insertNodetagSimple(db, bookmark_id, tag_id) {
    return db
      .insert({ bookmark_id, tag_id })
      .into('tagbookmark')
      .returning('*');
  }
};

module.exports = UserService;
