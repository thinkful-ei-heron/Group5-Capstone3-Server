CREATE TABLE listnode (
    list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT pkey_listnode PRIMARY KEY (
      list_id,
      node_id
    )
);