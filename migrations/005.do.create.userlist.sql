CREATE TABLE userlist (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
    CONSTRAINT pkey_userlist PRIMARY KEY (
      user_id,
      list_id
    )
);