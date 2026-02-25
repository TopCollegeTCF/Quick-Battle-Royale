CREATE TABLE battles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    winner_id INTEGER,
    battle_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id),
    FOREIGN KEY (winner_id) REFERENCES players(id)
);
