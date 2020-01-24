const uuid = require('uuid/v4');

const StorageService = {
  async getStructuredList(db, list_id) {
    const nodes = await this.getNodesFromList(db, list_id);
    await this.addTagsToNodes(db, nodes);
    const listInfo = await db('lists')
      .select('*')
      .where('id', list_id)
      .first();
    const first_node_id = listInfo.head;
    // initialize with root folder
    const nodeObj = {
      0: {
        name: listInfo.name || '',
        id: list_id,
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
    for (const [folderId, headId] of Object.entries(folders)) {
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
    }
    return nodeObj[0];
  },

  getListIds(db, user_id) {
    return db
      .pluck('list_id')
      .from('userlist')
      .where('user_id', user_id);
  },

  getNodeIds(db, list_id) {
    return db
      .pluck('node_id')
      .from('listnode')
      .whereIn('list_id', list_id);
  },
  getNodes(db, node_ids) {
    return db.from('nodes').whereIn('id', node_ids);
  },
  getLists(db, list_ids) {
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
        'nodes.archive_url as archive_url',
        'nodes.archive_date as archive_date',
        'listnode.next_node as next_node',
        'listnode.first_child as first_child'
      );
  },

  async addTagsToNodes(db, nodes) {
    const flatNodeObj = {}; // hashmap allows fast addition of tags
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
    let nodeTags = []; // [id, tag] as array
    let tags = {};
    nodes.forEach(node => {
      let {
        next_node,
        first_child,
        id,
        archive_date,
        archive_url,
        ...contents
      } = node;
      if (archive_date) {
        if (archive_url) {
          // ensure formatting for raw insert
          const timestamp = new Date(archive_date);
          archive_date = timestamp.toISOString();
        } else {
          // never datestamp a nonexistant link
          archive_date = null;
        }
      }
      let ptrs = [id, next_node || null, first_child || null];
      let contentArr = [
        id,
        contents.add_date,
        contents.last_modified,
        contents.ns_root,
        contents.title,
        contents.type,
        contents.icon,
        contents.url,
        archive_url,
        archive_date
      ];
      if (node.tags) {
        for (const tag of node.tags) {
          nodeTags.push({ id, tag });
          tags[tag] = null; //using hashmap as hashset until we get values during the transaction
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
        // this is safe: if list_id exists we just use that, if it does not exist we wait for the new value
        // eslint-disable-next-line require-atomic-updates
        [list_id] = await trx('lists')
          .insert({
            head,
            name: listName
          })
          .returning('id');
      }

      await trx.raw(
        'INSERT INTO userlist (list_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING',
        [list_id, user_id]
      );
      nodePointers = nodePointers.map(ptrArr => [list_id, ...ptrArr]);

      const spreadContents = [].concat(...nodeContents);
      const spreadPointers = [].concat(...nodePointers);
      await trx.raw(
        `INSERT INTO nodes (id, add_date, last_modified, ns_root, title, type, icon, url, archive_url, archive_date) VALUES ${nodes
          .map(_ => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .join(
            ', '
          )} ON CONFLICT (id) DO UPDATE SET (add_date, last_modified, ns_root, title, type, icon, url, archive_url, archive_date) = (EXCLUDED.add_date, EXCLUDED.last_modified, EXCLUDED.ns_root, EXCLUDED.title, EXCLUDED.type, EXCLUDED.icon, EXCLUDED.url, EXCLUDED.archive_url, EXCLUDED.archive_date)`,
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
      if (tagArr.length > 0) {
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

        const flatTags = [].concat(...nodeTags); // [node_id, tag_id, node_id, tag_id] etc
        await trx.raw(
          `INSERT INTO nodetag (node_id, tag_id) VALUES ${nodeTags
            .map(_ => '(?, ?)')
            .join(', ')} ON CONFLICT DO NOTHING`,
          flatTags
        );
      }
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
    const nodes = [];
    list.forEach((node, idx) => {
      let { contents, children, ...temp } = node;
      contents = contents === undefined ? children : contents;
      if (contents && contents.length > 0) {
        temp.first_child = contents[0].id;
        temp.type = 'folder';
        //order might be wonky but that doesn't matter
        const childNodes = this.flattenList(contents);
        nodes.push(...childNodes);
      } else {
        temp.type = contents ? 'folder' : 'bookmark';
      }
      const next = list[idx + 1];
      temp.next_node = next ? next.id : null;
      nodes.push(temp);
    });
    return nodes;
  }
};

module.exports = StorageService;
