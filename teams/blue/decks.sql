CREATE TABLE decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

