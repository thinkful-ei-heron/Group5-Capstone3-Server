CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    add_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP,
    ns_root TEXT,
    title TEXT,
    type TEXT NOT NULL,
    icon TEXT,
    url TEXT
);