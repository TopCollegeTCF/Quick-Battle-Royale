CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  recommendedlevelarena INTEGER CHECK (recommendedlevelarena BETWEEN 10 and 15) DEFAULT 11,
  max_members INTEGER DEFAULT 10,
  clan_id INTEGER,
  FOREIGN KEY (clan_id) REFERENCES Clans(id),
  trophies INTEGER DEFAULT 1 
);
INSERT INTO tournaments (nickname, clan_id) VALUES ('ProPlayer', 1
);
  	
