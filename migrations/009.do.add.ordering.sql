ALTER TABLE listnode 
ADD next_node UUID REFERENCES nodes(id) ON DELETE RESTRICT; --would break list structure, must be handled by app logic
