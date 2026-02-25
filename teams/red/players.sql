CREATE TABLE Players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    level INTEGER CHECK(level BETWEEN 1 AND 14),
    experience INTEGER DEFAULT 0,
    arena TEXT DEFAULT 'Arena 1',
    clan_id INTEGER,
  	weapon TEXT DEFAULT 'Sword',
  	race text DEFAULT 'human',
    FOREIGN KEY (clan_id) REFERENCES Clans(id)
  
);
