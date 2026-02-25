CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL,        -- common, rare, epic, legendary
    elixir_cost INTEGER NOT NULL
