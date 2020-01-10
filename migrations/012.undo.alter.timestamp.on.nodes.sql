ALTER TABLE nodes
DROP COLUMN add_date,
DROP COLUMN last_modified;

ALTER TABLE nodes
ADD COLUMN add_date TIMESTAMP,
ADD COLUMN last_modified TIMESTAMP;