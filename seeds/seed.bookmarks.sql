BEGIN;

TRUNCATE
  users,
  lists,
  folders,
  bookmarks,
  tags,
  userlist,
  listfolder,
  folderbookmarks,
  bookmarktag
  RESTART IDENTITY CASCADE;

INSERT INTO users (username, password, email, name)
VALUES
  ('dunder', '$2a$12$/CwJvVbQbC7Bt2FMkSo.Be3vzvtT80Jt6eDr4acBAdk3DOlOhMU4K', 'info1@email.com', 'dundy');

INSERT INTO lists (name)
VALUES
  ('Main');

INSERT INTO folders (name, parent_folder_id)
VALUES
  ('Sports', null),
  ('News', null),
  ('Games', null);

INSERT INTO bookmarks (name, url)
VALUES
  ('ESPN', 'espn.com'),
  ('Bleacher Report', 'bleacherreport.com'),
  ('SI', 'si.com'),
  ('NYT', 'nytimes.com'),
  ('WaPo', 'washingtonpost.com'),
  ('CNN', 'cnn.com'),
  ('IGN', 'ign.com'),
  ('Polygon', 'polygon.com'),
  ('Kotaku', 'kotaku.com');

INSERT INTO tags (tag)
VALUES
  ('sport'),
  ('new'),
  ('game');

INSERT INTO userlist (user_id, list_id)
VALUES
  (1, 1);


INSERT INTO listfolder (list_id, folder_id)
VALUES 
  (1, 1),
  (1, 2),
  (1, 3);

INSERT INTO folderbookmarks (folder_id, bookmark_id)
VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (2, 4),
  (2, 5),
  (2, 6),
  (3, 7),
  (3, 8),
  (3, 9);

INSERT INTO bookmarktag (bookmark_id, tag_id)
VALUES
  (1, 1),
  (2, 1),
  (3, 1),
  (4, 2),
  (5, 2),
  (6, 2),
  (7, 3),
  (8, 3),
  (9, 3);

COMMIT;
