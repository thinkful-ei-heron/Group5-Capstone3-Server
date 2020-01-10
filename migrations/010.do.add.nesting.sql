ALTER TABLE listnode 
ADD first_child INTEGER REFERENCES nodes(id) ON DELETE RESTRICT; --would break tree structure, must be handled by app logic
