BEGIN;

TRUNCATE
  users,
  lists,
  nodes,
  tags,
  userlist,
  listnode,
  nodetag
  RESTART IDENTITY CASCADE;

INSERT INTO users (username, password, email, name)
VALUES
  ('dunder', '$2a$12$/CwJvVbQbC7Bt2FMkSo.Be3vzvtT80Jt6eDr4acBAdk3DOlOhMU4K', 'info1@email.com', 'dundy');

INSERT INTO lists (name)
VALUES
  ('Main');

INSERT INTO nodes (title, last_modified, ns_root, type, icon, url)
VALUES
  ('Sports', null, null, 'folder', null, null),
  ('News', null, null, 'folder', null, null),
  ('Games', null, null, 'folder', null, null),
  ('ESPN', null, null, 'bookmark', null, 'espn.com'),
  ('Bleacher Report', null, null, 'bookmark', null, 'bleacherreport.com'),
  ('SI', null, null, 'bookmark', null, 'si.com'),
  ('NYT', null, null, 'bookmark', null, 'nytimes.com'),
  ('WaPo', null, null, 'bookmark', null, 'washingtonpost.com'),
  ('CNN', null, null, 'bookmark', null, 'cnn.com'),
  ('IGN', null, null, 'bookmark', null, 'ign.com'),
  ('Polygon', null, null, 'bookmark', null, 'polygon.com'),
  ('Kotaku', null, null, 'bookmark', null, 'kotaku.com');

INSERT INTO tags (tag)
VALUES
  ('sport'),
  ('new'),
  ('game');

INSERT INTO userlist (user_id, list_id)
VALUES
  (1, 1);


INSERT INTO listnode (list_id, node_id)
VALUES 
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (1, 5),
  (1, 6),
  (1, 7),
  (1, 8),
  (1, 9),
  (1, 10),
  (1, 11),
  (1, 12);


INSERT INTO nodetag (node_id, tag_id)
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
