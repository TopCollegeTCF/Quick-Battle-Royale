### 🏰 `Clans` (Кланы)
| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `INTEGER` 🏷️ | **PRIMARY KEY** — уникальный номер клана |
| `name` | `TEXT` 📛 | **NOT NULL** — название клана |
| `trophies` | `INTEGER` 🏆 | **DEFAULT 0** — общие трофеи |
| `max_members` | `INTEGER` 👥 | **DEFAULT 50** — максимум игроков |
