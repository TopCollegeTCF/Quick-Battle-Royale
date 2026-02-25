CREATE TABLE cards (
  	id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(30) NOT NULL,
  	is_legends BOOLEAN DEFAULT 0,
	  costOfTheElixir INTEGER NOT NULL,
  	damagePerSecond INTEGER NOT NULL,
  	health INTEGER NOT NULL,
  	movementSpeed INTEGER NOT NULL,
  	rangeAttack INTEGER NOT NULL,
  	targetEarthOrAir INTEGER NOT NULL,
  	fromWhichArena INTEGER NOT NULL,
  	imageURL VARCHAR NOT NULL
);
