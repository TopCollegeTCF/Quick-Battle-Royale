
CREATE TABLE IF NOT EXISTS players (
    player_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL
    chest_type_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,            
    rarity TEXT                   
    item_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,           
    description TEXT              
    chest_id SERIAL PRIMARY KEY,
    player_id INT REFERENCES players(player_id),
    chest_type_id INT REFERENCES chest_types(chest_type_id),
    is_opened BOOLEAN DEFAULT false,
    opened_at TIMESTAMP WITH TIME ZONE
    inventory_id SERIAL PRIMARY KEY,
    player_id INT REFERENCES players(player_id),
    item_id INT REFERENCES items(item_id),
    quantity INT DEFAULT 1
);
