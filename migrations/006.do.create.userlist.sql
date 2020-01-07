CREATE TABLE userlist (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
    pkey_userlist PRIMARY KEY (
      user_id,
      list_id
    )
);