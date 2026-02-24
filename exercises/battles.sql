CREATE TABLE Battles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    winner_id INTEGER NOT NULL,
    loser_id INTEGER NOT NULL,
    battle_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER CHECK(duration_seconds > 0),
    arena TEXT,
    winner_trophies_change INTEGER DEFAULT 30,
    loser_trophies_change INTEGER DEFAULT -30,
    FOREIGN KEY (winner_id) REFERENCES Players(id) ON DELETE CASCADE,
    FOREIGN KEY (loser_id) REFERENCES Players(id) ON DELETE CASCADE,
    CHECK (winner_id != loser_id)  -- Нельзя сражаться с собой
);

-- 📝 Добавь тестовые данные:
INSERT INTO Battles (winner_id, loser_id, duration_seconds, arena, winner_trophies_change, loser_trophies_change) VALUES
    (1, 2, 187, 'Legendary Arena', 32, -28),
    (3, 4, 203, 'Spooky Town', 30, -30),
    (2, 5, 156, 'Legendary Arena', 31, -29),
    (4, 1, 245, 'Jungle Arena', 30, -30);

-- ✅ Проверка:
SELECT 
    b.id,
    w.nickname AS winner,
    l.nickname AS loser,
    b.battle_date,
    b.duration_seconds || ' сек' AS duration,
    b.arena
FROM Battles b
JOIN Players w ON b.winner_id = w.id
JOIN Players l ON b.loser_id = l.id;
