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
  bookmarktag,
  RESTART IDENTITY CASCADE;

INSERT INTO users (username, password, email, name)
VALUES
  ('dunder', '$2a$12$/CwJvVbQbC7Bt2FMkSo.Be3vzvtT80Jt6eDr4acBAdk3DOlOhMU4K', 'info1@email.com', 'dundy');

INSERT INTO lists (name)
VALUES
  ('Main');

INSERT INTO folders (name)
VALUES
  ('News'),
  ('Sports'),
  ('Games');

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
  ('game'),
  ('sport'),
  ('new');

COMMIT;
