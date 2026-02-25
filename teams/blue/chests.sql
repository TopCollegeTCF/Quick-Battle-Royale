CREATE TABLE chests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    chest_type TEXT, -- например: 'Silver', 'Golden', 'Magical', 'Legendary'
    arena TEXT,      -- арена, на которой получен сундук
    is_opened INTEGER DEFAULT 0, -- 0 - закрыт, 1 - открыт
    received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);
INSERT INTO chests (player_id, chest_type, arena) VALUES (1, 'Silver', 'Arena 4');
