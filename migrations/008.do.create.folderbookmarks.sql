CREATE TABLE folderbookmarks (
    folder_id INTEGER REFERENCES folderS(id) ON DELETE CASCADE,
    bookmark_id INTEGER REFERENCES bookmarks(id) ON DELETE CASCADE,
    CONSTRAINT pkey_folderbookmarks PRIMARY KEY (
      folder_id,
      bookmark_id
    )
);