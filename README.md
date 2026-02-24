🔥 Clash Royale Database - эпический репозиторий для истинных королей! 🔥
🎮 Основные компоненты
🃏 Карты и статистика
sql
-- 🐉 Смертоносный Putyx
INSERT INTO cards (name, type, rarity, elixir_cost, description, target, is_deployed) 
VALUES ('Putyx', 'troop', 'rare', 3, 
'Маленький, но опасный убийца. При смерти призывает 2 копии себя с уменьшенным здоровьем и уроном.', 
'ground', TRUE);

-- 🦖 Грозный Rex
INSERT INTO cards (name, type, rarity, elixir_cost, description, target, is_deployed) 
VALUES ('Rex', 'troop', 'rare', 3, 
'Мощный тираннозавр-воин. Бьёт по области и после 3 ударов ревёт, замедляя врагов.', 
'ground', TRUE);
👥 Система игроков и предметов
python
# 🐍 Магия Python и SQLAlchemy
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, BigInteger, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
👥 Клановая система
sql
-- 🏰 Таблицы для кланов
CREATE TABLE IF NOT EXISTS clans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tag TEXT UNIQUE,
    description TEXT,
    trophies INTEGER DEFAULT 0,
    required_trophies INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 👥 Участники кланов
CREATE TABLE IF NOT EXISTS clan_members (
    player_id INTEGER NOT NULL,
    clan_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(player_id, clan_id),
    FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE
);
🎯 Команда разработчиков
Легендарные мастера кода:

Артём - главный архитектор клановой системы, настоящий гуру SQL

Александр Л. - эксперт по картам, создал механику всех юнитов

Надя - повелительница Player и Item систем

Ярик - пиксельный детектив, отладил каждую деталь

Даша - мастер оптимизации, доработала критические участки

Кирилл - архитектор баз данных, укрепил фундамент проекта

Арсен - главный командир, координатор всего процесса

🏆 Достижения проекта
Реализована полная система карт с уникальными механиками

Создана масштабируемая клановая система

Разработана надёжная система игроков

Внедрена продвинутая система статистики

Готовьтесь к эпическим битвам! 🎮

🔧 Как использовать
Клонируйте репозиторий

Установите зависимости

Наслаждайтесь мощью Clash Royale!
