CREATE TABLE chests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
  	rarity TEXT CHECK in ("Normal", "Rare", "Legendary", "Super legendary", "Super puper pro max legendary"),
  	price INTEGER,
    max_quantity INTEGER DEFAULT 0
);
