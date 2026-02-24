CREATE TABLE Cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    elixir_cost INTEGER CHECK(elixir_cost BETWEEN 1 AND 9),
    rarity TEXT CHECK(rarity IN ('Common', 'Rare', 'Epic', 'Legendary', 'Champion')),
    arena_unlock TEXT DEFAULT 'Training Camp'
);

-- 📝 Добавь тестовые данные:
INSERT INTO Cards (name, elixir_cost, rarity, arena_unlock) VALUES
    ('Хог Райдер', 4, 'Rare', 'Arena 4'),
    ('Мега Рыцарь', 7, 'Legendary', 'Arena 7'),
    ('Стрелы', 3, 'Common', 'Training Camp'),
    ('Ведьма', 5, 'Epic', 'Arena 2'),
    ('Замораживание', 4, 'Epic', 'Arena 8'),
    ('Электродух', 1, 'Common', 'Arena 11'),
    ('Королевский призрак', 3, 'Legendary', 'Arena 11');

-- ✅ Проверка:
SELECT * FROM Cards;
