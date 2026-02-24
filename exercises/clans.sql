CREATE TABLE Clans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    trophies INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 50
);

-- 📝 Добавь тестовые данные:
INSERT INTO Clans (name, trophies, max_members) VALUES 
    ('Красные Драконы', 15200, 50),
    ('Синие Варвары', 14800, 50),
    ('Золотые Рыцари', 16300, 50);

-- ✅ Проверка:
SELECT * FROM Clans;
