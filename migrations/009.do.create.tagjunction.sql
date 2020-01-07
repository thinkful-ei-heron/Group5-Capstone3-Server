CREATE TABLE bookmarktag (
    bookmark_id INTEGER REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    pkey_bookmarktag PRIMARY KEY (
      bookmark_id,
      tag_id
    )
);