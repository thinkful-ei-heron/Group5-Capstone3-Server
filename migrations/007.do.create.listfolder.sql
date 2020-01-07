CREATE TABLE listfolder (
    list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    CONSTRAINT pkey_listfolder PRIMARY KEY (
      list_id,
      folder_id
    )
);