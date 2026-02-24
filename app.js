// Конфигурация таблиц с описаниями и требованиями
const TABLES_CONFIG = [
    { 
        id: 'clans', 
        name: 'Clans', 
        icon: '🏰', 
        desc: 'Кланы игроков',
        tooltip: '🏰 **КЛАНЫ**\n• id INTEGER PRIMARY KEY\n• name TEXT NOT NULL\n• trophies INTEGER DEFAULT 0\n• max_members INTEGER DEFAULT 50',
        required: ['id', 'name', 'trophies', 'max_members']
    },
    { 
        id: 'players', 
        name: 'Players', 
        icon: '👑', 
        desc: 'Игроки',
        tooltip: '👑 **ИГРОКИ**\n• id INTEGER PRIMARY KEY\n• nickname TEXT NOT NULL\n• level INTEGER CHECK(1-14)\n• experience INTEGER DEFAULT 0\n• arena TEXT\n• clan_id INTEGER FOREIGN KEY',
        required: ['id', 'nickname', 'level', 'experience', 'arena', 'clan_id']
    },
    { 
        id: 'cards', 
        name: 'Cards', 
        icon: '🃏', 
        desc: 'Карты',
        tooltip: '🃏 **КАРТЫ**\n• id INTEGER PRIMARY KEY\n• name TEXT UNIQUE NOT NULL\n• elixir_cost INTEGER CHECK(1-9)\n• rarity TEXT\n• arena_unlock TEXT',
        required: ['id', 'name', 'elixir_cost', 'rarity', 'arena_unlock']
    },
    { 
        id: 'battles', 
        name: 'Battles', 
        icon: '⚔️', 
        desc: 'Сражения',
        tooltip: '⚔️ **СРАЖЕНИЯ**\n• id INTEGER PRIMARY KEY\n• winner_id INTEGER FOREIGN KEY\n• loser_id INTEGER FOREIGN KEY\n• battle_date DATETIME DEFAULT\n• duration_seconds INTEGER CHECK\n• arena TEXT\n• winner_trophies_change INTEGER DEFAULT 30\n• loser_trophies_change INTEGER DEFAULT -30',
        required: ['id', 'winner_id', 'loser_id', 'battle_date', 'duration_seconds', 'arena', 'winner_trophies_change', 'loser_trophies_change']
    },
    { 
        id: 'player_cards', 
        name: 'PlayerCards', 
        icon: '🎴', 
        desc: 'Коллекция карт',
        tooltip: '🎴 **КАРТЫ ИГРОКОВ**\n• player_id INTEGER FOREIGN KEY\n• card_id INTEGER FOREIGN KEY\n• level INTEGER CHECK(1-14)\n• count INTEGER DEFAULT 1\n• is_favorite BOOLEAN DEFAULT 0',
        required: ['player_id', 'card_id', 'level', 'count', 'is_favorite']
    },
    { 
        id: 'decks', 
        name: 'Decks', 
        icon: '🃏', 
        desc: 'Колоды',
        tooltip: '🃏 **КОЛОДЫ**\n• id INTEGER PRIMARY KEY\n• player_id INTEGER FOREIGN KEY\n• name TEXT NOT NULL\n• card1_id-card8_id FOREIGN KEY\n• is_active BOOLEAN DEFAULT 0\n• created_date DATETIME DEFAULT',
        required: ['id', 'player_id', 'name', 'is_active', 'created_date']
    },
    { 
        id: 'tournaments', 
        name: 'Tournaments', 
        icon: '🏆', 
        desc: 'Турниры',
        tooltip: '🏆 **ТУРНИРЫ**\n• id INTEGER PRIMARY KEY\n• name TEXT NOT NULL\n• max_players INTEGER\n• start_date DATETIME\n• prize TEXT',
        required: ['id', 'name', 'max_players', 'start_date', 'prize']
    },
    { 
        id: 'achievements', 
        name: 'Achievements', 
        icon: '⭐', 
        desc: 'Достижения',
        tooltip: '⭐ **ДОСТИЖЕНИЯ**\n• id INTEGER PRIMARY KEY\n• player_id INTEGER FOREIGN KEY\n• name TEXT NOT NULL\n• date_earned DATETIME DEFAULT',
        required: ['id', 'player_id', 'name', 'date_earned']
    },
    { 
        id: 'shop', 
        name: 'Shop', 
        icon: '🛒', 
        desc: 'Магазин',
        tooltip: '🛒 **МАГАЗИН**\n• id INTEGER PRIMARY KEY\n• item_name TEXT NOT NULL\n• price_gems INTEGER\n• available BOOLEAN DEFAULT 1',
        required: ['id', 'item_name', 'price_gems', 'available']
    },
    { 
        id: 'chests', 
        name: 'Chests', 
        icon: '📦', 
        desc: 'Сундуки',
        tooltip: '📦 **СУНДУКИ**\n• id INTEGER PRIMARY KEY\n• player_id INTEGER FOREIGN KEY\n• chest_type TEXT\n• arena TEXT\n• unlock_time DATETIME',
        required: ['id', 'player_id', 'chest_type', 'arena', 'unlock_time']
    }
];

// Веса для подсчета очков
const SCORES = {
    column: 1,        // базовая колонка
    primary_key: 10,  // PRIMARY KEY
    foreign_key: 8,   // FOREIGN KEY
    not_null: 5,      // NOT NULL
    unique: 5,        // UNIQUE
    check: 5,         // CHECK
    default: 3,       // DEFAULT
    type_match: 2     // правильный тип данных
};

window.addEventListener('load', () => {
    renderTablesList('red');
    renderTablesList('blue');
    loadTeamStats('red');
    loadTeamStats('blue');
});

function renderTablesList(team) {
    const container = document.getElementById(`${team}Tables`);
    if (!container) return;
    container.innerHTML = '';
    
    TABLES_CONFIG.forEach(table => {
        const item = document.createElement('div');
        item.className = 'table-item';
        
        // Форматируем подсказку
        const tooltipHtml = table.tooltip
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        
        item.innerHTML = `
            <span class="table-icon">${table.icon}</span>
            <div class="table-info">
                <div class="table-name">${table.name}</div>
                <div class="table-desc">${table.desc}</div>
            </div>
            <div class="table-stats">
                <span class="table-preview" id="${team}-${table.id}-cols">0</span>
            </div>
            <div class="tooltip">
                ${tooltipHtml}
                <em>Наведи на другие таблицы</em>
            </div>
        `;
        container.appendChild(item);
    });
}

async function loadTeamStats(team) {
    let totalScore = 0;
    
    for (const table of TABLES_CONFIG) {
        try {
            const response = await fetch(`teams/${team}/${table.id}.sql`);
            const content = await response.text();
            const score = calculateTableScore(content, table.required);
            
            document.getElementById(`${team}-${table.id}-cols`).textContent = score;
            totalScore += score;
        } catch (error) {
            document.getElementById(`${team}-${table.id}-cols`).textContent = '0';
        }
    }
    
    document.getElementById(`${team}Score`).textContent = totalScore;
}

function calculateTableScore(sql, requiredColumns) {
    let score = 0;
    const sqlLower = sql.toLowerCase();
    
    requiredColumns.forEach(col => {
        // Базовая колонка
        if (sqlLower.includes(col.toLowerCase())) {
            score += SCORES.column;
            
            // Проверка типов и ограничений
            const colIndex = sqlLower.indexOf(col.toLowerCase());
            const context = sqlLower.substring(colIndex, colIndex + 100);
            
            if (context.includes('integer')) score += SCORES.type_match;
            if (context.includes('text')) score += SCORES.type_match;
            if (context.includes('primary key')) score += SCORES.primary_key;
            if (context.includes('foreign key')) score += SCORES.foreign_key;
            if (context.includes('not null')) score += SCORES.not_null;
            if (context.includes('unique')) score += SCORES.unique;
            if (context.includes('check')) score += SCORES.check;
            if (context.includes('default')) score += SCORES.default;
        }
    });
    
    return score;
}

function enterBattle(team) {
    localStorage.setItem('selectedTeam', team);
    window.location.href = 'battle.html';
}
