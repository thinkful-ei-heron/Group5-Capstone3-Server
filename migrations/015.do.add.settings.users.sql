ALTER TABLE users
ADD preview BOOLEAN DEFAULT FALSE,
ADD extra BOOLEAN DEFAULT FALSE,
ADD autosave BOOLEAN DEFAULT FALSE,
ADD color TEXT DEFAULT '7F7F7F';
