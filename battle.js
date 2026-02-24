// Глобальные переменные
let currentTeam = null;
let db = null;
let SQL = null;
let teamFiles = {};
let validationResults = {
    clans: { valid: false, score: 0, columns: [], errors: [] },
    players: { valid: false, score: 0, columns: [], errors: [] },
    cards: { valid: false, score: 0, columns: [], errors: [] },
    battles: { valid: false, score: 0, columns: [], errors: [] }
};

// Эталонные требования к таблицам
const REQUIRED_COLUMNS = {
    clans: [
        { name: 'id', type: 'INTEGER', constraints: ['PRIMARY KEY'] },
        { name: 'name', type: 'TEXT', constraints: ['NOT NULL'] },
        { name: 'trophies', type: 'INTEGER', constraints: ['DEFAULT 0'] },
        { name: 'max_members', type: 'INTEGER', constraints: ['DEFAULT 50'] }
    ],
    players: [
        { name: 'id', type: 'INTEGER', constraints: ['PRIMARY KEY'] },
        { name: 'nickname', type: 'TEXT', constraints: ['NOT NULL'] },
        { name: 'level', type: 'INTEGER', constraints: ['CHECK'] },
        { name: 'experience', type: 'INTEGER', constraints: ['DEFAULT 0'] },
        { name: 'arena', type: 'TEXT', constraints: [] },
        { name: 'clan_id', type: 'INTEGER', constraints: ['FOREIGN KEY'] }
    ],
    cards: [
        { name: 'id', type: 'INTEGER', constraints: ['PRIMARY KEY'] },
        { name: 'name', type: 'TEXT', constraints: ['UNIQUE', 'NOT NULL'] },
        { name: 'elixir_cost', type: 'INTEGER', constraints: ['CHECK'] },
        { name: 'rarity', type: 'TEXT', constraints: [] },
        { name: 'arena_unlock', type: 'TEXT', constraints: [] }
    ],
    battles: [
        { name: 'id', type: 'INTEGER', constraints: ['PRIMARY KEY'] },
        { name: 'winner_id', type: 'INTEGER', constraints: ['NOT NULL', 'FOREIGN KEY'] },
        { name: 'loser_id', type: 'INTEGER', constraints: ['NOT NULL', 'FOREIGN KEY'] },
        { name: 'battle_date', type: 'DATETIME', constraints: ['DEFAULT'] },
        { name: 'duration_seconds', type: 'INTEGER', constraints: ['CHECK'] },
        { name: 'arena', type: 'TEXT', constraints: [] },
        { name: 'winner_trophies_change', type: 'INTEGER', constraints: ['DEFAULT 30'] },
        { name: 'loser_trophies_change', type: 'INTEGER', constraints: ['DEFAULT -30'] }
    ]
};

// Веса для подсчета очков
const COLUMN_SCORES = {
    'PRIMARY KEY': 10,
    'FOREIGN KEY': 8,
    'NOT NULL': 5,
    'UNIQUE': 5,
    'CHECK': 5,
    'DEFAULT': 3,
    'просто колонка': 1
};

// Инициализация при загрузке
window.addEventListener('load', async () => {
    // Получаем выбранную команду
    currentTeam = localStorage.getItem('selectedTeam') || 'red';
    
    // Обновляем интерфейс под команду
    updateTeamUI();
    
    // Инициализируем SQL.js
    await initSQL();
    
    // Загружаем SQL файлы
    await loadTeamFiles();
    
    // Отображаем файлы
    renderSQLFiles();
    
    // Добавляем лог
    addLogMessage(`🔥 ${currentTeam === 'red' ? 'Красная' : 'Синяя'} башня выбрана!`, 'info');
    addLogMessage('📁 SQL файлы загружены. Нажми "ПРОВЕРИТЬ" для анализа!', 'info');
});

// Обновление UI под команду
function updateTeamUI() {
    const header = document.getElementById('battleHeader');
    const badge = document.getElementById('teamBadge');
    const emoji = document.getElementById('teamEmoji');
    const name = document.getElementById('teamName');
    
    if (currentTeam === 'red') {
        badge.style.background = 'linear-gradient(135deg, rgba(255, 68, 68, 0.2), rgba(255, 68, 68, 0.1))';
        badge.style.borderColor = '#ff4444';
        emoji.textContent = '🔴';
        name.textContent = 'КРАСНАЯ БАШНЯ';
    } else {
        badge.style.background = 'linear-gradient(135deg, rgba(68, 68, 255, 0.2), rgba(68, 68, 255, 0.1))';
        badge.style.borderColor = '#4444ff';
        emoji.textContent = '🔵';
        name.textContent = 'СИНЯЯ БАШНЯ';
    }
}

// Инициализация SQL.js
async function initSQL() {
    try {
        SQL = await initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
        });
        addLogMessage('✅ SQLite загружен!', 'success');
    } catch (error) {
        addLogMessage('❌ Ошибка загрузки SQLite: ' + error.message, 'error');
    }
}

// Загрузка файлов команды
async function loadTeamFiles() {
    const files = ['clans', 'players', 'cards', 'battles'];
    
    for (const file of files) {
        try {
            const response = await fetch(`teams/${currentTeam}/${file}.sql`);
            const content = await response.text();
            teamFiles[file] = content;
        } catch (error) {
            teamFiles[file] = `-- ${file}.sql\n-- Файл не найден`;
            addLogMessage(`⚠️ Файл ${file}.sql не найден`, 'error');
        }
    }
}

// Отображение SQL файлов
function renderSQLFiles() {
    const container = document.getElementById('sqlFilesList');
    container.innerHTML = '';
    
    const files = [
        { name: 'clans', icon: '🏰', color: '#ffd700' },
        { name: 'players', icon: '👑', color: '#4ecdc4' },
        { name: 'cards', icon: '🃏', color: '#ffe66d' },
        { name: 'battles', icon: '⚔️', color: '#ff6b6b' }
    ];
    
    files.forEach(file => {
        const content = teamFiles[file.name] || '-- Пустой файл';
        const preview = content.split('\n').slice(0, 3).join('\n');
        
        const card = document.createElement('div');
        card.className = `sql-file-card ${file.name}`;
        card.innerHTML = `
            <div class="file-header">
                <span class="file-name">${file.icon} ${file.name}.sql</span>
                <span class="file-status" id="status-${file.name}"></span>
            </div>
            <pre class="file-preview">${escapeHTML(preview)}</pre>
        `;
        
        container.appendChild(card);
    });
}

// Экранирование HTML
function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

// Добавление сообщения в лог
function addLogMessage(message, type) {
    const logMessages = document.getElementById('logMessages');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    logMessages.appendChild(entry);
    logMessages.scrollTop = logMessages.scrollHeight;
}

// Очистка лога
window.clearLog = function() {
    const logMessages = document.getElementById('logMessages');
    logMessages.innerHTML = '';
    addLogMessage('🧹 Лог очищен', 'info');
};

// Парсинг CREATE TABLE
function parseCreateTable(sql, tableName) {
    const result = {
        columns: [],
        errors: []
    };
    
    // Ищем CREATE TABLE для нужной таблицы
    const regex = new RegExp(`CREATE\\s+TABLE\\s+${tableName}\\s*\\((.*?)\\)`, 'is');
    const match = sql.match(regex);
    
    if (!match) {
        result.errors.push(`CREATE TABLE ${tableName} не найдена`);
        return result;
    }
    
    const columnsText = match[1];
    
    // Разбираем колонки (учитываем вложенные скобки)
    let depth = 0;
    let currentColumn = '';
    let inString = false;
    
    for (let i = 0; i < columnsText.length; i++) {
        const char = columnsText[i];
        
        if (char === "'" && columnsText[i-1] !== '\\') {
            inString = !inString;
        }
        
        if (!inString) {
            if (char === '(') depth++;
            if (char === ')') depth--;
        }
        
        if (char === ',' && depth === 0 && !inString) {
            if (currentColumn.trim() && !currentColumn.toLowerCase().includes('foreign key')) {
                result.columns.push(parseColumn(currentColumn.trim()));
            }
            currentColumn = '';
        } else {
            currentColumn += char;
        }
    }
    
    // Добавляем последнюю колонку
    if (currentColumn.trim() && !currentColumn.toLowerCase().includes('foreign key')) {
        result.columns.push(parseColumn(currentColumn.trim()));
    }
    
    return result;
}

// Парсинг отдельной колонки
function parseColumn(columnText) {
    const parts = columnText.split(/\s+/);
    const name = parts[0].toLowerCase();
    const type = parts[1] ? parts[1].toUpperCase() : '';
    const constraints = parts.slice(2).join(' ').toUpperCase();
    
    return {
        name,
        type,
        constraints,
        hasPK: constraints.includes('PRIMARY KEY'),
        hasFK: constraints.includes('REFERENCES') || constraints.includes('FOREIGN KEY'),
        hasNotNull: constraints.includes('NOT NULL'),
        hasUnique: constraints.includes('UNIQUE'),
        hasCheck: constraints.includes('CHECK'),
        hasDefault: constraints.includes('DEFAULT')
    };
}

// Проверка таблицы
function validateTable(tableName, sql) {
    const result = {
        valid: false,
        score: 0,
        columns: [],
        errors: [],
        matches: []
    };
    
    const required = REQUIRED_COLUMNS[tableName];
    if (!required) {
        result.errors.push('Неизвестная таблица');
        return result;
    }
    
    const parsed = parseCreateTable(sql, tableName);
    result.columns = parsed.columns;
    result.errors = parsed.errors;
    
    // Проверяем каждую требуемую колонку
    required.forEach(req => {
        const found = parsed.columns.find(col => col.name === req.name);
        
        if (found) {
            // Проверяем тип
            const typeMatch = found.type === req.type;
            
            // Проверяем ограничения
            const constraintChecks = {
                'PRIMARY KEY': found.hasPK,
                'FOREIGN KEY': found.hasFK || (req.name.includes('_id') && found.hasFK),
                'NOT NULL': found.hasNotNull,
                'UNIQUE': found.hasUnique,
                'CHECK': found.hasCheck,
                'DEFAULT': found.hasDefault
            };
            
            // Считаем очки
            let columnScore = 0;
            const matches = [];
            
            // Базовые очки за наличие колонки
            columnScore += COLUMN_SCORES['просто колонка'];
            matches.push(`✅ ${req.name} - базовая колонка (+1)`);
            
            // Проверяем каждое требуемое ограничение
            req.constraints.forEach(constraint => {
                if (constraintChecks[constraint]) {
                    columnScore += COLUMN_SCORES[constraint];
                    matches.push(`✅ ${req.name} - ${constraint} (+${COLUMN_SCORES[constraint]})`);
                } else {
                    result.errors.push(`❌ ${req.name} - отсутствует ${constraint}`);
                }
            });
            
            // Бонус за правильный тип
            if (typeMatch) {
                columnScore += 2;
                matches.push(`✅ ${req.name} - правильный тип (+2)`);
            } else {
                result.errors.push(`❌ ${req.name} - неправильный тип (нужен ${req.type})`);
            }
            
            result.score += columnScore;
            result.matches.push(...matches);
        } else {
            result.errors.push(`❌ Отсутствует колонка: ${req.name}`);
        }
    });
    
    // Проверяем наличие внешних ключей в таблице
    const hasFKReferences = sql.toLowerCase().includes('foreign key') || 
                           sql.toLowerCase().includes('references');
    
    if (tableName === 'players' || tableName === 'battles') {
        if (hasFKReferences) {
            result.score += 5;
            result.matches.push(`✅ Есть FOREIGN KEY связи (+5)`);
        } else {
            result.errors.push(`❌ Отсутствуют FOREIGN KEY связи`);
        }
    }
    
    result.valid = result.errors.length === 0;
    
    return result;
}

// Проверка всех таблиц
function validateAllTables() {
    addLogMessage('🔍 Начинаем проверку таблиц...', 'info');
    
    let totalScore = 0;
    
    // Проверяем каждую таблицу
    for (const [tableName, sql] of Object.entries(teamFiles)) {
        const result = validateTable(tableName, sql);
        validationResults[tableName] = result;
        
        // Обновляем статус в UI
        updateTableStatus(tableName, result);
        
        // Добавляем в лог
        if (result.valid) {
            addLogMessage(`✅ ${tableName}.sql: КОРРЕКТНО (+${result.score}🏆)`, 'success');
            result.matches.forEach(match => addLogMessage(`  ${match}`, 'info'));
        } else {
            addLogMessage(`❌ ${tableName}.sql: ОШИБКИ`, 'error');
            result.errors.forEach(error => addLogMessage(`  ${error}`, 'error'));
        }
        
        totalScore += result.score;
    }
    
    // Обновляем общий счет
    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('totalTrophies').textContent = totalScore;
    
    addLogMessage(`🎉 ИТОГО: ${totalScore} кубков!`, 'success');
    
    // Визуализируем
    visualizeResults();
}

// Обновление статуса таблицы в UI
function updateTableStatus(tableName, result) {
    const statusElement = document.getElementById(`status-${tableName}`);
    if (statusElement) {
        statusElement.className = `file-status ${result.valid ? 'valid' : 'invalid'}`;
    }
    
    // Обновляем карточки результатов
    renderResultsCard(tableName, result);
}

// Отображение карточки результатов
function renderResultsCard(tableName, result) {
    const container = document.getElementById('tablesResults');
    
    // Ищем существующую карточку
    let card = document.getElementById(`result-${tableName}`);
    
    if (!card) {
        card = document.createElement('div');
        card.id = `result-${tableName}`;
        card.className = `result-card`;
        container.appendChild(card);
    }
    
    card.className = `result-card ${result.valid ? 'valid' : 'invalid'}`;
    
    const icons = {
        clans: '🏰',
        players: '👑',
        cards: '🃏',
        battles: '⚔️'
    };
    
    card.innerHTML = `
        <div class="result-header">
            <span class="result-name">${icons[tableName]} ${tableName}.sql</span>
            <span class="result-score">${result.score}🏆</span>
        </div>
        <div class="result-details">
            <div class="result-detail">
                <span>Колонок:</span>
                <span>${result.columns.length}</span>
            </div>
            <div class="result-detail">
                <span>Статус:</span>
                <span style="color: ${result.valid ? '#44ff44' : '#ff4444'}">
                    ${result.valid ? '✅ Корректно' : '❌ Ошибки'}
                </span>
            </div>
        </div>
    `;
}

// Визуализация результатов
function visualizeResults() {
    try {
        // Создаем новую БД для визуализации
        const db = new SQL.Database();
        
        // Выполняем SQL в правильном порядке
        db.run("PRAGMA foreign_keys = ON;");
        
        // Пытаемся выполнить SQL (может быть с ошибками)
        const tables = ['clans', 'cards', 'players', 'battles'];
        
        tables.forEach(table => {
            try {
                db.run(teamFiles[table]);
            } catch (e) {
                // Игнорируем ошибки выполнения
            }
        });
        
        // Визуализируем схему
        visualizeSchema(db);
        
        // Визуализируем граф
        visualizeGraph(db);
        
        // Визуализируем данные
        visualizeData(db);
        
    } catch (error) {
        console.error('Visualization error:', error);
    }
}

// Визуализация схемы
function visualizeSchema(db) {
    const grid = document.getElementById('tablesGrid');
    grid.innerHTML = '';
    
    try {
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
        
        if (tables.length) {
            for (const table of tables[0].values) {
                const tableName = table[0];
                const result = validationResults[tableName] || { valid: false, score: 0, columns: [] };
                
                const tableInfo = db.exec(`PRAGMA table_info(${tableName});`);
                const foreignKeys = db.exec(`PRAGMA foreign_key_list(${tableName});`);
                
                const fkSet = new Set();
                if (foreignKeys.length) {
                    for (const fk of foreignKeys[0].values) {
                        fkSet.add(fk[3]);
                    }
                }
                
                const card = document.createElement('div');
                card.className = `table-card ${result.valid ? 'valid' : 'invalid'}`;
                
                let columnsHtml = '';
                if (tableInfo.length) {
                    for (const col of tableInfo[0].values) {
                        const isPK = col[5] === 1;
                        const isFK = fkSet.has(col[1]);
                        
                        columnsHtml += `
                            <div class="column-item">
                                <span class="column-name">${col[1]}</span>
                                <span>
                                    ${isPK ? '<span class="column-badge pk">PK</span>' : ''}
                                    ${isFK ? '<span class="column-badge fk">FK</span>' : ''}
                                    ${col[3] === 1 ? '<span class="column-badge notnull">NN</span>' : ''}
                                </span>
                            </div>
                        `;
                    }
                }
                
                const icons = {
                    'Clans': '🏰',
                    'Players': '👑',
                    'Cards': '🃏',
                    'Battles': '⚔️'
                };
                
                card.innerHTML = `
                    <div class="table-header">
                        <span class="table-name">${icons[tableName] || '📋'} ${tableName}</span>
                        <span class="table-score">${result.score}🏆</span>
                    </div>
                    <div class="table-columns">
                        ${columnsHtml || '<div class="column-item">Нет колонок</div>'}
                    </div>
                `;
                
                grid.appendChild(card);
            }
        }
    } catch (error) {
        grid.innerHTML = '<div class="error">Ошибка загрузки схемы</div>';
    }
}

// Визуализация графа
function visualizeGraph(db) {
    const container = document.getElementById('graphContainer');
    
    try {
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
        
        const nodes = [];
        const edges = [];
        const nodeSet = new Set();
        
        if (tables.length) {
            for (const table of tables[0].values) {
                const tableName = table[0];
                nodeSet.add(tableName);
                
                const colors = {
                    'Clans': '#ffd700',
                    'Players': '#4ecdc4',
                    'Cards': '#ffe66d',
                    'Battles': '#ff6b6b'
                };
                
                nodes.push({
                    id: tableName,
                    label: tableName,
                    color: colors[tableName] || '#95a5a6',
                    font: { color: 'white', size: 16 },
                    shape: 'box',
                    shadow: true
                });
                
                const foreignKeys = db.exec(`PRAGMA foreign_key_list(${tableName});`);
                if (foreignKeys.length) {
                    for (const fk of foreignKeys[0].values) {
                        if (nodeSet.has(fk[2])) {
                            edges.push({
                                from: tableName,
                                to: fk[2],
                                label: fk[3],
                                arrows: 'to',
                                color: { color: '#ffd700', highlight: '#ffa500' },
                                font: { color: 'white', size: 12 }
                            });
                        }
                    }
                }
            }
        }
        
        const data = { nodes, edges };
        const options = {
            layout: {
                hierarchical: false
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -3000,
                    centralGravity: 0.3,
                    springLength: 200,
                    springConstant: 0.04,
                    damping: 0.09
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200
            }
        };
        
        new vis.Network(container, data, options);
        
    } catch (error) {
        container.innerHTML = '<div style="color: white; padding: 20px;">Ошибка загрузки графа</div>';
    }
}

// Визуализация данных
function visualizeData(db) {
    const container = document.getElementById('dataContainer');
    container.innerHTML = '';
    
    try {
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
        
        if (tables.length) {
            for (const table of tables[0].values) {
                const tableName = table[0];
                
                try {
                    const data = db.exec(`SELECT * FROM ${tableName} LIMIT 5;`);
                    
                    if (data.length && data[0].values.length) {
                        const div = document.createElement('div');
                        div.className = 'data-table';
                        
                        let html = `<h4>${tableName}</h4>`;
                        html += '<table><thead><tr>';
                        
                        for (const col of data[0].columns) {
                            html += `<th>${col}</th>`;
                        }
                        html += '</tr></thead><tbody>';
                        
                        for (const row of data[0].values) {
                            html += '<tr>';
                            for (const cell of row) {
                                html += `<td>${cell !== null ? cell : 'NULL'}</td>`;
                            }
                            html += '</tr>';
                        }
                        
                        html += '</tbody></table>';
                        div.innerHTML = html;
                        container.appendChild(div);
                    }
                } catch (e) {
                    // Таблица пуста или ошибка
                }
            }
        }
        
        if (container.children.length === 0) {
            container.innerHTML = '<div style="color: white; padding: 20px;">Нет данных для отображения</div>';
        }
        
    } catch (error) {
        container.innerHTML = '<div style="color: white; padding: 20px;">Ошибка загрузки данных</div>';
    }
}

// Переключение вкладок
document.querySelectorAll('.viz-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.viz-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.viz-pane').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const view = btn.dataset.view;
        document.getElementById(`${view}Pane`).classList.add('active');
    });
});

// Кнопка проверки
document.getElementById('analyzeBtn').addEventListener('click', validateAllTables);
