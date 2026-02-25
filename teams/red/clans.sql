CREATE TABLE Clans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    trophies INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 50,
  	data_create TIME,
  	level INTEGER DEFAULT 0,
  	player_members INTEGER NOT NULL,
  	num_matches INTEGER DEFAULT 0,
  	num_losses INTEGER DEFAULT 0,
  	num_win INTEGER DEFAULT 0
    
);
