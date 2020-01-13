const StorageService = {
  async getStructuredList(db, list_id) {
    return await this.createStructure(db, list_id);
  },

  async createStructure(db, list_id) {
    const nodes = await this.getNodesFromList(db, list_id);
    // console.log(nodes);
    await this.addTagsToNodes(db, nodes);
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
    const folders = { 0: first_node_id };
    for (const node of nodes) {
      nodeObj[node.id] = node;
      if (node.first_child) {
        folders[node.id] = node.first_child;
      }
    }
    // console.log(folders);
    for (const [folderId, headId] of Object.entries(folders)) {
      // console.log(folderId);
      const contents = [];
      let cur = nodeObj[headId];

      while (cur) {
        contents.push(cur);
        const next = nodeObj[cur.next_node];
        delete cur.first_child;
        delete cur.next_node;
        cur = next;
      }
      nodeObj[folderId].contents = contents;
      // console.log(nodeObj[folderId]);
    }
    return nodeObj[0];
  },

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

  async addTagsToNodes(db, nodes) {
    const flatNodeObj = {}; //hashmap allows fast addition of tags
    const nodeIds = [];
    for (const node of nodes) {
      const id = node.id;
      node.tags = [];
      nodeIds.push(id);
      flatNodeObj[id] = node;
    }
    const tags = await db('nodetag')
      .whereIn('nodetag.node_id', nodeIds)
      .innerJoin('tags', 'nodetag.tag_id', '=', 'tags.id')
      .select('nodetag.node_id as id', 'tags.tag as tag');
    console.log(tags);
    for (const tag of tags) {
      flatNodeObj[tag.id].tags.push(tag.tag);
    }
  },

  async insertStructuredList(db, list, listName, user_id, list_id = null) {
    /*
     * this is large enough that it's tempting to split it up
     * but most of it is an irreducible transaction
     * which includes raw SQL which requires flat arrays for bound parameters
     * probably best to keep info about the structure of the subarrays nearby
     * and that's in the other major chunk (the for-each)
     */

    this.forceIds(list.contents);
    const nodes = this.flattenList(list.contents);
    const head = list.contents[0].id;

    const nodeContents = [];
    let nodePointers = [];
    let nodeTags = []; //[id, tag] as array for
    let tags = {};
    nodes.forEach(node => {
      let { next_node, first_child, id, ...contents } = node;
      let ptrs = [id, next_node || null, first_child || null];
      contents.id = id;
      let contentArr = [
        contents.id,
        contents.add_date,
        contents.last_modified,
        contents.ns_root,
        contents.title,
        contents.type,
        contents.icon,
        contents.url
      ];
      if (node.tags) {
        for (const tag of node.tags) {
          nodeTags.push({ id, tag });
          tags[tag] = null;
        }
      }

      contentArr = contentArr.map(val => (val === undefined ? null : val));
      nodeContents.push(contentArr);
      ptrs = ptrs.map(val => (val === undefined ? null : val));
      nodePointers.push(ptrs);
    });

    await db.transaction(async trx => {
      if (list_id) {
        await trx('lists')
          .where('id', list_id)
          .update({ name: listName, head });
      } else {
        // eslint-disable-next-line require-atomic-updates
        [list_id] = await trx('lists')
          .insert({
            head,
            name: listName
          })
          .returning('id');
        // console.log(list_id);
      }
      // await db('userlist')
      //   .transacting(trx)
      //   .insert({ list_id, user_id })
      //   .catch(); //if it collides we're ok

      await trx.raw(
        'INSERT INTO userlist (list_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
        [list_id, user_id]
      );
      // console.log(list_id);
      nodePointers = nodePointers.map(ptrArr => [list_id, ...ptrArr]);
      // console.log('contents', nodeContents);
      const spreadContents = [].concat(...nodeContents);
      const spreadPointers = [].concat(...nodePointers);
      // console.log(spreadContents, nodePointers);
      await trx.raw(
        `INSERT INTO nodes (id, add_date, last_modified, ns_root, title, type, icon, url) VALUES ${nodes
          .map(_ => '(?, ?, ?, ?, ?, ?, ?, ?)')
          .join(
            ', '
          )} ON CONFLICT (id) DO UPDATE SET (add_date, last_modified, ns_root, title, type, icon, url) = (EXCLUDED.add_date, EXCLUDED.last_modified, EXCLUDED.ns_root, EXCLUDED.title, EXCLUDED.type, EXCLUDED.icon, EXCLUDED.url)`,
        spreadContents
      );

      await trx.raw(
        `INSERT INTO listnode (list_id, node_id, next_node, first_child) VALUES ${nodes
          .map(_ => '(?, ?, ?, ?)')
          .join(
            ', '
          )} ON CONFLICT (list_id, node_id) DO UPDATE SET (next_node, first_child) = (EXCLUDED.next_node, EXCLUDED.first_child)`,
        spreadPointers
      );

      const tagArr = Object.keys(tags);

      await trx.raw(
        `INSERT INTO tags (tag) VALUES ${tagArr
          .map(_ => '(?)')
          .join(', ')} ON CONFLICT DO NOTHING`,
        tagArr
      );

      const knownTags = await trx('tags')
        .whereIn('tag', tagArr)
        .select('id', 'tag');

      for (const t of knownTags) {
        tags[t.tag] = t.id;
      }

      nodeTags = nodeTags.map(({ id, tag }) => {
        return [id, tags[tag]];
      });

      const flatTags = [].concat(...nodeTags); //[node_id, tag_id, node_id, tag_id] etc
      console.log(flatTags);
      await trx.raw(
        `INSERT INTO nodetag (node_id, tag_id) VALUES ${nodeTags
          .map(_ => '(?, ?)')
          .join(', ')} ON CONFLICT DO NOTHING`,
        flatTags
      );
    });
    return list_id;
  },

  forceIds(list) {
    list.forEach(node => {
      let { contents, children } = node;
      contents = contents === undefined ? children : contents;
      if (contents) {
        this.forceIds(contents);
      }
      node.id = this.forceIdUUID(node.id);
    });
  },

  forceIdUUID(id) {
    if (
      id &&
      id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      return id;
    }
    return uuid();
  },

  flattenList(list) {
    console.log('flatten');
    const nodes = [];
    list.forEach((node, idx) => {
      let { contents, children, ...temp } = node;
      // console.log('contents', contents)
      // console.log('children', children)
      contents = contents === undefined ? children : contents;
      // console.log(Array.isArray(contents))
      if (contents) {
        temp.first_child = contents[0].id;
        temp.type = 'folder';
        //order might be wonky but that doesn't matter
        const childNodes = this.flattenList(contents);
        // console.log('children', childNodes.map(node => {
        //   const {icon, ...rest} = node;
        //   return rest;
        // }));
        nodes.push(...childNodes);
      } else {
        temp.type = 'bookmark';
      }
      const next = list[idx + 1];
      temp.next_node = next ? next.id : null;
      nodes.push(temp);
    });
    // console.log('flat', nodes.map(node => {
    //   const {icon, ...rest} = node;
    //   return rest;
    // }));
    return nodes;
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
  }
};

module.exports = StorageService;
