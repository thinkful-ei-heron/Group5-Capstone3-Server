CREATE TABLE folderbookmarks (
    folder_id INTEGER REFERENCES folder(id) ON DELETE CASCADE,
    bookmark_id INTEGER REFERENCES bookmarks(id) ON DELETE CASCADE,
    pkey_folderbookmarks PRIMARY KEY (
      folder_id,
      bookmark_id
    )
);