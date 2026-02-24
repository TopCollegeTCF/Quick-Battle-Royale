// Конфигурация таблиц с гифками
const TABLES_VISUAL = [
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

let currentTeam = null;
let teamFiles = {};
let currentTable = 'clans';
let SQL = null;
let db = null;

// Инициализация
window.addEventListener('load', async () => {
    currentTeam = localStorage.getItem('selectedTeam') || 'red';
    updateTeamUI();
    await initSQL();
    await loadTeamFiles();
    renderTablesList();
    selectTable('clans');
    await validateAllTables();
});

// Обновление UI команды
function updateTeamUI() {
    const badge = document.querySelector('.team-badge');
    const emoji = document.querySelector('.team-emoji');
    const name = document.querySelector('.team-name');
    
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

// Инициализация SQL.js
async function initSQL() {
    SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
    });
}

// Загрузка файлов команды
async function loadTeamFiles() {
    for (const table of TABLES_VISUAL) {
        try {
            const response = await fetch(`teams/${currentTeam}/${table.id}.sql`);
            teamFiles[table.id] = await response.text();
        } catch {
            teamFiles[table.id] = `-- ${table.id}.sql\n-- Файл не найден`;
        }
    }
}

// Отрисовка списка таблиц слева
function renderTablesList() {
    const container = document.getElementById('tablesList');
    container.innerHTML = '';
    
    TABLES_VISUAL.forEach(table => {
        const item = document.createElement('div');
        item.className = `table-mini-card ${table.id === currentTable ? 'active' : ''}`;
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

// Выбор таблицы для отображения
function selectTable(tableId) {
    currentTable = tableId;
    
    // Подсветка активной
    document.querySelectorAll('.table-mini-card').forEach(c => c.classList.remove('active'));
    event?.currentTarget.classList.add('active');
    
    // Обновление информации
    const table = TABLES_VISUAL.find(t => t.id === tableId);
    document.getElementById('selectedIcon').textContent = table.icon;
    document.getElementById('selectedName').textContent = table.name;
    document.getElementById('selectedDesc').textContent = table.desc;
    document.getElementById('tableGif').src = `docs/${table.gif}`;
    
    // Парсим и отображаем схему
    renderTableSchema(tableId);
}

// Отрисовка схемы таблицы
function renderTableSchema(tableId) {
    const container = document.getElementById('tableSchema');
    const sql = teamFiles[tableId];
    
    // Парсим CREATE TABLE
    const columns = parseCreateTable(sql, tableId);
    
    if (columns.length === 0) {
        container.innerHTML = '<div style="color: #666; padding: 20px; text-align: center;">Нет данных о колонках</div>';
        return;
    }
    
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
                <div class="column-badges">
                    ${badges.join(' ')}
                </div>
            </div>
            <div class="column-constraints">
                ${col.constraints || ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Парсинг CREATE TABLE
function parseCreateTable(sql, tableName) {
    const columns = [];
    const regex = new RegExp(`CREATE\\s+TABLE\\s+${tableName}\\s*\\((.*?)\\)`, 'is');
    const match = sql.match(regex);
    
    if (!match) return columns;
    
    const columnsText = match[1];
    const lines = columnsText.split(',').filter(line => !line.toLowerCase().includes('foreign key'));
    
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 2) return;
        
        const name = parts[0].toLowerCase();
        const type = parts[1].toUpperCase();
        const constraints = parts.slice(2).join(' ').toUpperCase();
        
        columns.push({
            name,
            type,
            constraints,
            pk: constraints.includes('PRIMARY KEY'),
            fk: name.includes('_id') || constraints.includes('REFERENCES'),
            nn: constraints.includes('NOT NULL'),
            unq: constraints.includes('UNIQUE'),
            chk: constraints.includes('CHECK'),
            def: constraints.includes('DEFAULT')
        });
    });
    
    return columns;
}

// Проверка всех таблиц
async function validateAllTables() {
    db = new SQL.Database();
    db.run("PRAGMA foreign_keys = ON;");
    
    let totalScore = 0;
    
    for (const table of TABLES_VISUAL) {
        try {
            db.run(teamFiles[table.id]);
            
            // Получаем информацию о таблице
            const tableInfo = db.exec(`PRAGMA table_info(${table.id});`);
            const columnCount = tableInfo.length ? tableInfo[0].values.length : 0;
            
            // Обновляем статус
            document.getElementById(`status-${table.id}`).className = `table-mini-status valid`;
            
            // Считаем очки (просто для демо)
            totalScore += columnCount * 2;
            
            // Добавляем в правую колонку
            addToRightColumn(table, columnCount, true);
            
        } catch (e) {
            document.getElementById(`status-${table.id}`).className = `table-mini-status`;
            addToRightColumn(table, 0, false);
        }
    }
    
    document.getElementById('totalTrophies').textContent = totalScore;
}

// Добавление в правую колонку
function addToRightColumn(table, columnCount, valid) {
    const container = document.getElementById('tablesGrid');
    
    const card = document.createElement('div');
    card.className = `table-preview-card ${valid ? 'valid' : 'invalid'}`;
    card.innerHTML = `
        <div class="preview-header">
            <span class="preview-name">
                <span>${table.icon}</span>
                <span>${table.name}</span>
            </span>
            <span class="preview-score">${columnCount * 2}</span>
        </div>
        <div class="preview-columns">
            <div class="preview-column">
                <span>Колонок:</span>
                <span>${columnCount}</span>
            </div>
            <div class="preview-column">
                <span>Статус:</span>
                <span style="color: ${valid ? '#44ff44' : '#ff4444'}">
                    ${valid ? '✓' : '✗'}
                </span>
            </div>
        </div>
    `;
    
    container.appendChild(card);
}

// Назад
function goBack() {
    window.location.href = 'index.html';
}
