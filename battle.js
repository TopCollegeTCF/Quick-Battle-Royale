const TABLES = [
    { id: 'clans', name: 'Clans', icon: '🏰', gif: 'clans.gif', desc: 'Кланы игроков' },
    { id: 'players', name: 'Players', icon: '👑', gif: 'players.gif', desc: 'Профили игроков' },
    { id: 'cards', name: 'Cards', icon: '🃏', gif: 'cards.gif', desc: 'Игровые карты' },
    { id: 'battles', name: 'Battles', icon: '⚔️', gif: 'battles.gif', desc: 'История сражений' },
    { id: 'player_cards', name: 'PlayerCards', icon: '🎴', gif: 'player_cards.gif', desc: 'Коллекция карт' },
    { id: 'decks', name: 'Decks', icon: '🃏', gif: 'decks.gif', desc: 'Колоды' },
    { id: 'tournaments', name: 'Tournaments', icon: '🏆', gif: 'tournaments.gif', desc: 'Турниры' },
    { id: 'achievements', name: 'Achievements', icon: '⭐', gif: 'achievements.gif', desc: 'Достижения' },
    { id: 'shop', name: 'Shop', icon: '🛒', gif: 'shop.gif', desc: 'Магазин' },
    { id: 'chests', name: 'Chests', icon: '📦', gif: 'chests.gif', desc: 'Сундуки' }
];

const SCORES = {
    column: 1, primary_key: 10, foreign_key: 8,
    not_null: 5, unique: 5, check: 5, default: 3, type_match: 2
};

let currentTeam = null;
let teamFiles = {};
let currentTable = 'clans';
let SQL = null;
let db = null;

window.addEventListener('load', async () => {
    currentTeam = localStorage.getItem('selectedTeam') || 'red';
    updateTeamUI();
    await initSQL();
    await loadTeamFiles();
    renderTablesList();
    selectTable('clans');
    await validateAllTables();
});

function updateTeamUI() {
    const badge = document.querySelector('.team-badge');
    const emoji = document.getElementById('teamEmoji');
    const name = document.getElementById('teamName');
    
    if (currentTeam === 'red') {
        badge.classList.add('red-badge');
        badge.classList.remove('blue-badge');
        emoji.textContent = '🔴';
        name.textContent = 'Красная башня';
    } else {
        badge.classList.add('blue-badge');
        badge.classList.remove('red-badge');
        emoji.textContent = '🔵';
        name.textContent = 'Синяя башня';
    }
}

async function initSQL() {
    SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
    });
}

async function loadTeamFiles() {
    for (const table of TABLES) {
        try {
            const response = await fetch(`teams/${currentTeam}/${table.id}.sql`);
            teamFiles[table.id] = await response.text();
        } catch {
            teamFiles[table.id] = `-- ${table.id}.sql\n-- Файл не найден`;
        }
    }
}

function renderTablesList() {
    const container = document.getElementById('tablesList');
    if (!container) return;
    container.innerHTML = '';
    
    TABLES.forEach(table => {
        const item = document.createElement('div');
        item.className = `table-mini-card ${table.id === currentTable ? 'active' : ''}`;
        item.setAttribute('data-table', table.id);
        item.onclick = () => selectTable(table.id);
        item.innerHTML = `
            <span class="table-mini-icon">${table.icon}</span>
            <div class="table-mini-info">
                <div class="table-mini-name">${table.name}</div>
            </div>
            <div class="table-mini-status" id="status-${table.id}"></div>
        `;
        container.appendChild(item);
    });
}

function selectTable(tableId) {
    currentTable = tableId;
    
    document.querySelectorAll('.table-mini-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`[data-table="${tableId}"]`);
    if (activeCard) activeCard.classList.add('active');
    
    const table = TABLES.find(t => t.id === tableId);
    if (!table) return;
    
    document.getElementById('selectedIcon').textContent = table.icon;
    document.getElementById('selectedName').textContent = table.name;
    document.getElementById('selectedDesc').textContent = table.desc;
    
    const gifPath = `docs/${table.gif}`;
    const gifImg = document.getElementById('tableGif');
    gifImg.src = gifPath;
    gifImg.onerror = () => {
        gifImg.src = 'https://via.placeholder.com/400x400?text=No+GIF';
    };
    
    renderTableSchema(tableId);
}

function parseCreateTable(sql, tableName) {
    const columns = [];
    
    if (!sql || sql.trim() === '') {
        return columns;
    }
    
    try {
        const tablePattern = new RegExp(`CREATE\\s+TABLE\\s+${tableName}\\s*\\(([\\s\\S]*?)\\)`, 'i');
        const match = sql.match(tablePattern);
        
        if (!match || !match[1]) {
            return columns;
        }
        
        let columnsText = match[1];
        columnsText = columnsText.replace(/FOREIGN\s+KEY.*?(,|$)/gi, '');
        
        let depth = 0;
        let current = '';
        const parts = [];
        
        for (let i = 0; i < columnsText.length; i++) {
            const char = columnsText[i];
            
            if (char === '(') depth++;
            else if (char === ')') depth--;
            
            if (char === ',' && depth === 0) {
                if (current.trim()) parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            parts.push(current.trim());
        }
        
        parts.forEach(part => {
            if (!part || part.toLowerCase().startsWith('foreign')) return;
            
            const words = part.split(/\s+/);
            if (words.length < 2) return;
            
            const name = words[0].replace(/[`\[\]"]/g, '');
            const type = words[1].toUpperCase();
            const constraints = words.slice(2).join(' ').toUpperCase();
            
            columns.push({
                name,
                type,
                constraints,
                pk: constraints.includes('PRIMARY KEY') || constraints.includes('PRIMARY'),
                fk: name.includes('_id') || constraints.includes('REFERENCES'),
                nn: constraints.includes('NOT NULL') || constraints.includes('NOT'),
                unq: constraints.includes('UNIQUE'),
                chk: constraints.includes('CHECK'),
                def: constraints.includes('DEFAULT')
            });
        });
        
    } catch (error) {
        console.error('Ошибка парсинга:', error);
    }
    
    return columns;
}

function renderTableSchema(tableId) {
    const container = document.getElementById('tableSchema');
    const sql = teamFiles[tableId];
    
    if (!sql) {
        container.innerHTML = '<div style="color: #666; padding: 20px; text-align: center;">❌ SQL файл не загружен</div>';
        return;
    }
    
    const columns = parseCreateTable(sql, tableId);
    
    if (columns.length === 0) {
        container.innerHTML = '<div style="color: #666; padding: 20px; text-align: center;">❌ Нет данных о колонках или ошибка в SQL</div>';
        return;
    }
    
    document.getElementById('gifContainer').style.display = 'flex';
    container.innerHTML = '';
    
    columns.forEach(col => {
        const badges = [];
        if (col.pk) badges.push('<span class="badge pk">PK</span>');
        if (col.fk) badges.push('<span class="badge fk">FK</span>');
        if (col.nn) badges.push('<span class="badge nn">NN</span>');
        if (col.unq) badges.push('<span class="badge unq">UNQ</span>');
        if (col.chk) badges.push('<span class="badge chk">CHK</span>');
        if (col.def) badges.push('<span class="badge def">DEF</span>');
        
        const card = document.createElement('div');
        card.className = 'column-card';
        card.innerHTML = `
            <div class="column-header-row">
                <div class="column-name-type">
                    <span class="column-name">${col.name}</span>
                    <span class="column-type">${col.type}</span>
                </div>
                <div class="column-badges">${badges.join(' ')}</div>
            </div>
            <div class="column-constraints">${col.constraints || '—'}</div>
        `;
        container.appendChild(card);
    });
}

async function validateAllTables() {
    db = new SQL.Database();
    db.run("PRAGMA foreign_keys = ON;");
    
    let totalScore = 0;
    const grid = document.getElementById('tablesGrid');
    grid.innerHTML = '';
    
    for (const table of TABLES) {
        try {
            db.run(teamFiles[table.id]);
            
            const tableInfo = db.exec(`PRAGMA table_info(${table.id});`);
            const columnCount = tableInfo.length ? tableInfo[0].values.length : 0;
            
            const score = calculateTableScore(teamFiles[table.id], table.id);
            totalScore += score;
            
            document.getElementById(`status-${table.id}`).className = 'table-mini-status valid';
            
            const card = document.createElement('div');
            card.className = `table-preview-card valid`;
            card.innerHTML = `
                <div class="preview-header">
                    <span class="preview-name">
                        <span>${table.icon}</span>
                        <span>${table.name}</span>
                    </span>
                    <span class="preview-score">${score}</span>
                </div>
                <div class="preview-columns">
                    <div class="preview-column">
                        <span>Колонок:</span>
                        <span>${columnCount}</span>
                    </div>
                    <div class="preview-column">
                        <span>Статус:</span>
                        <span style="color: #44ff44">✓ Работает</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
            
        } catch (e) {
            document.getElementById(`status-${table.id}`).className = 'table-mini-status';
            
            const card = document.createElement('div');
            card.className = `table-preview-card invalid`;
            card.innerHTML = `
                <div class="preview-header">
                    <span class="preview-name">
                        <span>${table.icon}</span>
                        <span>${table.name}</span>
                    </span>
                    <span class="preview-score">0</span>
                </div>
                <div class="preview-columns">
                    <div class="preview-column">
                        <span>Колонок:</span>
                        <span>0</span>
                    </div>
                    <div class="preview-column">
                        <span>Статус:</span>
                        <span style="color: #ff4444">✗ Ошибка</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        }
    }
    
    document.getElementById('totalTrophies').textContent = totalScore;
}

function calculateTableScore(sql, tableId) {
    let score = 0;
    const columns = parseCreateTable(sql, tableId);
    
    columns.forEach(col => {
        score += SCORES.column;
        
        if (col.type === 'INTEGER' || col.type === 'TEXT' || 
            col.type === 'DATETIME' || col.type === 'BOOLEAN') {
            score += SCORES.type_match;
        }
        
        if (col.pk) score += SCORES.primary_key;
        if (col.fk) score += SCORES.foreign_key;
        if (col.nn) score += SCORES.not_null;
        if (col.unq) score += SCORES.unique;
        if (col.chk) score += SCORES.check;
        if (col.def) score += SCORES.default;
    });
    
    return score;
}

function goBack() {
    window.location.href = 'index.html';
}
