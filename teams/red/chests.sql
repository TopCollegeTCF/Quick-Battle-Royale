CREATE table if not EXISTS chests(
  name VARCHAR,
  price INTEGER not NULL,
  rare VARCHAR,
  loot VARCHAR,
  legendary_loot_chance INTEGER CHECK(normale_loot_chance BETWEEN 10 AND 40) DEFAULT 10,
  rare_loot_chance INTEGER CHECK(normale_loot_chance BETWEEN 20 AND 60) DEFAULT 20,
  normale_loot_chance INTEGER CHECK(normale_loot_chance BETWEEN 30 AND 80) DEFAULT 30
);

