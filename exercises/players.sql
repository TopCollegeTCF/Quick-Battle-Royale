CREATE TABLE Players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    level INTEGER CHECK(level BETWEEN 1 AND 14),
    experience INTEGER DEFAULT 0,
    arena TEXT DEFAULT 'Arena 1',
    clan_id INTEGER,
    FOREIGN KEY (clan_id) REFERENCES Clans(id) ON DELETE SET NULL
);

-- 📝 Добавь тестовые данные:
INSERT INTO Players (nickname, level, experience, arena, clan_id) VALUES
    ('DragonSlayer', 12, 45000, 'Legendary Arena', 1),
    ('WizardKing', 14, 78000, 'Legendary Arena', 2),
    ('BarbarianQueen', 10, 23000, 'Spooky Town', 1),
    ('KnightRider', 8, 12000, 'Jungle Arena', 3),
    ('ArcherQueen', 13, 56000, 'Legendary Arena', NULL);

-- ✅ Проверка:
SELECT * FROM Players;
