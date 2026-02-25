CREATE TABLE player_cards(
	id INTEGER PRIMARY KEY,
  	name VARCHAR NOT NULL ,
  	mana_cost INTEGER DEFAULT 50,
 	class VARCHAR NOT NULL,
  	type VARCHAR NOT NULL,
  	player_id INTEGER
);
