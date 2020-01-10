ALTER TABLE lists DROP CONSTRAINT lists_head_fkey;
ALTER TABLE lists ADD CONSTRAINT lists_head_fkey FOREIGN KEY(head) REFERENCES nodes(id);