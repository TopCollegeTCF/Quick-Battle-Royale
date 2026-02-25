CREATE TABLE IF NOT EXISTS player_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    card_name TEXT,
    rarity TEXT
);

INSERT INTO player_cards (user_id, username, card_name, rarity) VALUES 
(1, 'ClashMaster', 'Мегарыцарь', 'Легендарная'),
(1, 'ClashMaster', 'Всадник на кабане', 'Редкая'),
(2, 'Сёма_Чебурек', 'Принц', 'Эпическая'),
(2, 'Сёма_Чебурек', 'Рыцарь', 'Обычная'),
(3, 'King_CR', 'Спарки', 'Легендарная'),
(3, 'King_CR', 'Мушкетер', 'Редкая');

SELECT * FROM player_cards;
