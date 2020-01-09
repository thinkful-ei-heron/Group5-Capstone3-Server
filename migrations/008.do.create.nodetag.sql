CREATE TABLE nodetag (
    node_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    CONSTRAINT pkey_bookmarktag PRIMARY KEY (
      node_id,
      tag_id
    )
);