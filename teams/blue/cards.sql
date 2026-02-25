CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Тип персонажа (например, воин, заклинание, здание)
    rarity VARCHAR(50) NOT NULL, -- Редкость (обычный, редкий, эпический, легендарный)
    elixir_cost INT NOT NULL, -- Стоимость эликсира
    description TEXT, -- Описание персонажа
    level INT NOT NULL DEFAULT 1, -- Уровень персонажа
    max_level INT NOT NULL, -- Максимальный уровень персонажа
    hitpoints INT NOT NULL, -- Здоровье персонажа         
    damage INT NOT NULL, -- Урон персонажа
    speed INT NOT NULL, -- Скорость персонажа
    range INT NOT NULL, -- Дальность атаки
    target VARCHAR(50) NOT NULL -- Цель атаки (наземные, воздушные, наземные и воздушные)
);

