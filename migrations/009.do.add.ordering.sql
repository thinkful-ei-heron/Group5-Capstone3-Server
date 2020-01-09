ALTER TABLE listnode 
ADD next_node INTEGER REFERENCES nodes(id) ON DELETE RESTRICT; --would break list structure, must be handled by app logic
