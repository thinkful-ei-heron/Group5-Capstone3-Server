ALTER TABLE nodes
ADD archive_url TEXT,
ADD archive_date DATE,
ADD CONSTRAINT archive_dates_must_have_archive CHECK ((archive_date IS NULL) OR ((archive_date IS NOT NULL) AND (archive_url IS NOT NULL)));