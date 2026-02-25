CREATE TABLE shop (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT,"Legendary Chest"
    item_type TEXT, "chest"
    rarity TEXT,"легендарный"
    price_gems INTEGER,
    price_gold INTEGER,
);
INSERT INTO shop (item_name, item_type, price_gems, available_until) 
VALUES ('Legendary Chest', 'chest', 500, 10000,);
