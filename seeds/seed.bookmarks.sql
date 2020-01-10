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


<<<<<<< HEAD

INSERT INTO nodes (id, title, last_modified, ns_root, type, icon, url)
VALUES
  ('cb8290f4-daa7-4d96-8165-e51f8a848715','Sports', null, null, 'folder', null, null),
  ('38cb070a-74d4-48cc-af78-1cd28bdd8665','News', null, null, 'folder', null, null),
  ('03846b62-0ae2-4503-b0c1-a096b2c0811e','Games', null, null, 'folder', null, null),
  ('bea6a72a-2864-4b80-8222-b970007ac3eb','ESPN', null, null, 'bookmark', null, 'espn.com'),
  ('d0151cc2-66a2-421f-be1d-ca74f1470382','Bleacher Report', null, null, 'bookmark', null, 'bleacherreport.com'),
  ('046b86cb-443c-4adf-8f93-980fb428f4f9','SI', null, null, 'bookmark', null, 'si.com'),
  ('b83ed9ad-9399-4c9c-9645-a981c2564faf','NYT', null, null, 'bookmark', null, 'nytimes.com'),
  ('e753ddad-eba9-4ad0-8046-32a818831579','WaPo', null, null, 'bookmark', null, 'washingtonpost.com'),
  ('f2bf7206-a81f-4410-bd1c-04bb638d8898','CNN', null, null, 'bookmark', null, 'cnn.com'),
  ('d90dc333-a937-4e7a-9552-4c7bcf68c999','IGN', null, null, 'bookmark', null, 'ign.com'),
  ('7cc9a1f2-3820-45a8-9ef4-94360e81d6d5','Polygon', null, null, 'bookmark', null, 'polygon.com'),
  ('236cdff2-afcc-454f-b479-5f15a484f779','Kotaku', null, null, 'bookmark', null, 'kotaku.com');
=======
INSERT INTO folders (name, parent_folder_id)
VALUES
  ('Sports', null),
  ('News', null),
  ('Games', null);
>>>>>>> develop

INSERT INTO lists (name, head)
VALUES
  ('Main', 'cb8290f4-daa7-4d96-8165-e51f8a848715');

INSERT INTO tags (tag)
VALUES
  ('sport'),
  ('new'),
  ('game');

INSERT INTO userlist (user_id, list_id)
VALUES
  (1, 1);


INSERT INTO listnode (list_id, node_id, next_node, first_child)
VALUES 
  (1, 'cb8290f4-daa7-4d96-8165-e51f8a848715', '38cb070a-74d4-48cc-af78-1cd28bdd8665', 'bea6a72a-2864-4b80-8222-b970007ac3eb'),
  (1, '38cb070a-74d4-48cc-af78-1cd28bdd8665', '03846b62-0ae2-4503-b0c1-a096b2c0811e', 'd0151cc2-66a2-421f-be1d-ca74f1470382'),
  (1, '03846b62-0ae2-4503-b0c1-a096b2c0811e', 'b83ed9ad-9399-4c9c-9645-a981c2564faf', '046b86cb-443c-4adf-8f93-980fb428f4f9'),
  (1, 'bea6a72a-2864-4b80-8222-b970007ac3eb', null, null),
  (1, 'd0151cc2-66a2-421f-be1d-ca74f1470382', null, null),
  (1, '046b86cb-443c-4adf-8f93-980fb428f4f9', null, null),
  (1, 'b83ed9ad-9399-4c9c-9645-a981c2564faf', 'e753ddad-eba9-4ad0-8046-32a818831579', null),
  (1, 'e753ddad-eba9-4ad0-8046-32a818831579', 'f2bf7206-a81f-4410-bd1c-04bb638d8898', null),
  (1, 'f2bf7206-a81f-4410-bd1c-04bb638d8898', 'd90dc333-a937-4e7a-9552-4c7bcf68c999', null),
  (1, 'd90dc333-a937-4e7a-9552-4c7bcf68c999', '7cc9a1f2-3820-45a8-9ef4-94360e81d6d5', null),
  (1, '7cc9a1f2-3820-45a8-9ef4-94360e81d6d5', '236cdff2-afcc-454f-b479-5f15a484f779', null),
  (1, '236cdff2-afcc-454f-b479-5f15a484f779', null, null);


INSERT INTO nodetag (node_id, tag_id)
VALUES
  ('cb8290f4-daa7-4d96-8165-e51f8a848715', 1),
  ('38cb070a-74d4-48cc-af78-1cd28bdd8665', 1),
  ('03846b62-0ae2-4503-b0c1-a096b2c0811e', 1),
  ('bea6a72a-2864-4b80-8222-b970007ac3eb', 2),
  ('d0151cc2-66a2-421f-be1d-ca74f1470382', 2),
  ('046b86cb-443c-4adf-8f93-980fb428f4f9', 2),
  ('b83ed9ad-9399-4c9c-9645-a981c2564faf', 3),
  ('e753ddad-eba9-4ad0-8046-32a818831579', 3),
  ('f2bf7206-a81f-4410-bd1c-04bb638d8898', 3);

COMMIT;
