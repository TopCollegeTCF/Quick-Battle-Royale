Над нашим репозиторием пыхтели наши ребята:

1 Код - Карты:![i](https://github.com/user-attachments/assets/0298b496-09e5-400b-a3dd-6c0873b96b98)
INSERT INTO cards (name, type, rarity, elixir_cost, description, target, is_deployed)
VALUES ('Putyx', 'troop', 'rare', 3, 'Маленький, но опасный убийца. При смерти призывает 2 копии себя с уменьшенным здоровьем и уроном.', 'ground', TRUE);


INSERT INTO card_stats (card_id, hitpoints, damage, dps, hit_speed, speed, count, lifetime)
VALUES (1000, 420, 140, 175, 0.8, 'very_fast', 1, NULL);

INSERT INTO cards (name, type, rarity, elixir_cost, description, target, is_deployed)
VALUES ('Rex', 'troop', 'rare', 3, 'Мощный тираннозавр-воин. Бьёт по области и после 3 ударов ревёт, замедляя врагов.', 'ground', TRUE);


INSERT INTO card_stats (card_id, hitpoints, damage, dps, hit_speed, speed, count, lifetime)
VALUES (1000, 2200, 320, 133 , 2.4, 2.5, 'slow', 1, NULL);


2 Код - Player, item:![i (1)](https://github.com/user-attachments/assets/3e30c5a1-cc92-4c9c-a3c4-fffd32d3dfc1)
...
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, BigInteger, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime
from typing import Annotated, Optional

from sqlalchemy import String, Integer, Float, Text, Boolean, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass
...(Очень сократил)



3 Код - Кланы:
CREATE TABLE IF NOT EXISTS clans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tag TEXT UNIQUE,
    description TEXT,
    trophies INTEGER DEFAULT 0,
    required_trophies INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clan_members (
    player_id INTEGER NOT NULL,
    clan_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',  
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(player_id, clan_id),
    FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS clan_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clan_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,     
    description TEXT,
    event_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clan_wars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clan_id INTEGER NOT NULL,
    season INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE
);



один из примеров:
| Легендарки | Обычные | РЕдкие | Эпик | чемпы |
| :---: | :---: | :---: | :---: | :---: |
| принцесса | лучница | мини Пека | принц | Шустрый шахтер |


Над работой работали такие слоняры как:
Артем - машина по созданию кланов
Александр Л. - лучший игрок клэш рояля, сделал карты
Надя - молодец, сделала  Player, item
Ярик - самый ценый игрок, пересчитал все пиксели
Даша - доработала код, молодец
Кирилл - доработал код
Арсен - главнокомандующий
