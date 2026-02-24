// Конфигурация таблиц
const TABLES_CONFIG = [
    { id: 'clans', name: 'Clans', icon: '🏰', desc: 'Кланы игроков' },
    { id: 'players', name: 'Players', icon: '👑', desc: 'Игроки' },
    { id: 'cards', name: 'Cards', icon: '🃏', desc: 'Карты' },
    { id: 'battles', name: 'Battles', icon: '⚔️', desc: 'Сражения' },
    { id: 'player_cards', name: 'PlayerCards', icon: '🎴', desc: 'Коллекция карт' },
    { id: 'decks', name: 'Decks', icon: '🃏', desc: 'Колоды' },
    { id: 'tournaments', name: 'Tournaments', icon: '🏆', desc: 'Турниры' },
    { id: 'achievements', name: 'Achievements', icon: '⭐', desc: 'Достижения' },
    { id: 'shop', name: 'Shop', icon: '🛒', desc: 'Магазин' },
    { id: 'chests', name: 'Chests', icon: '📦', desc: 'Сундуки' }
];

// Веса для подсчета очков
const SCORES = {
    column: 4,
    primary_key: 2,
    foreign_key: 2,
    not_null: 1,
    unique: 2,
    check: 2,
    default: 3,
    type_match: 2
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
        
        item.innerHTML = `
            <span class="table-icon">${table.icon}</span>
            <div class="table-info">
                <div class="table-name">${table.name}</div>
                <div class="table-desc">${table.desc}</div>
            </div>
            <div class="table-stats">
                <span class="table-preview" id="${team}-${table.id}-cols">0</span>
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
            const score = calculateTableScore(content);
            
            document.getElementById(`${team}-${table.id}-cols`).textContent = score;
            totalScore += score;
        } catch (error) {
            document.getElementById(`${team}-${table.id}-cols`).textContent = '0';
        }
    }
    
    document.getElementById(`${team}Score`).textContent = totalScore;
}

function calculateTableScore(sql) {
    let score = 0;
    const sqlLower = sql.toLowerCase();
    
    // Считаем колонки (грубо, но для демо достаточно)
    const createMatch = sqlLower.match(/create table.*?\((.*?)\)/s);
    if (createMatch) {
        const columnsText = createMatch[1];
        const columns = columnsText.split(',').filter(col => 
            !col.toLowerCase().includes('foreign key')
        );
        
        columns.forEach(col => {
            score += SCORES.column;
            
            if (col.includes('primary key')) score += SCORES.primary_key;
            if (col.includes('foreign key') || col.includes('references')) score += SCORES.foreign_key;
            if (col.includes('not null')) score += SCORES.not_null;
            if (col.includes('unique')) score += SCORES.unique;
            if (col.includes('check')) score += SCORES.check;
            if (col.includes('default')) score += SCORES.default;
            if (col.includes('int') || col.includes('text') || col.includes('date')) {
                score += SCORES.type_match;
            }
        });
    }
    
    return score;
}

function enterBattle(team) {
    localStorage.setItem('selectedTeam', team);
    window.location.href = 'battle.html';
}
