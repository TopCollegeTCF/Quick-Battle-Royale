// Глобальные переменные
let db = null;
let SQL = null;
let redTeamProgress = { clans: false, players: false, cards: false, battles: false };
let blueTeamProgress = { clans: false, players: false, cards: false, battles: false };
let battleLog = [];
let timerInterval = null;
let timeLeft = 3600; // 60 минут в секундах

// Инициализация при загрузке
window.addEventListener('load', async () => {
    await initSQL();
    await loadSQLCards();
    startTimer();
    addLogMessage('⚔️ Битва началась! Загрузи свои SQL файлы в репозиторий', 'info');
});

// Инициализация SQL.js
async function initSQL() {
    try {
        SQL = await initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
        });
        addLogMessage('✅ SQLite загружен в браузер!', 'success');
    } catch (error) {
        addLogMessage('❌ Ошибка загрузки SQLite: ' + error.message, 'error');
    }
}

// Загрузка SQL карточек
async function loadSQLCards() {
    const sqlFiles = [
        { name: 'clans.sql', type: 'clan', icon: '🏰', description: 'CREATE TABLE Clans' },
        { name: 'players.sql', type: 'player', icon: '👑', description: 'CREATE TABLE Players' },
        { name: 'cards.sql', type: 'card', icon: '🃏', description: 'CREATE TABLE Cards' },
        { name: 'battles.sql', type: 'battle', icon: '⚔️', description: 'CREATE TABLE Battles' }
    ];

    const redContainer = document.getElementById('sqlCards');
    const blueContainer = document.getElementById('sqlCardsBlue');

    for (const file of sqlFiles) {
        try {
            // Пытаемся загрузить содержимое файла из репозитория
            const response = await fetch(`exercises/${file.name}`);
            const content = await response.text();
            
            // Создаем карточку для красной команды
            const redCard = createSQLCard(file, content, 'red');
            redContainer.appendChild(redCard);
            
            // Создаем карточку для синей команды
            const blueCard = createSQLCard(file, content, 'blue');
            blueContainer.appendChild(blueCard);
            
        } catch (error) {
            // Если файл не найден, создаем пустую карточку
            const emptyContent = `-- ${file.name}\n-- Напиши CREATE TABLE здесь`;
            const redCard = createSQLCard(file, emptyContent, 'red');
            redContainer.appendChild(redCard);
            
            const blueCard = createSQLCard(file, emptyContent, 'blue');
            blueContainer.appendChild(blueCard);
        }
    }
}

// Создание SQL карточки
function createSQLCard(file, content, team) {
    const card = document.createElement('div');
    card.className = `sql-card ${file.type}`;
    card.dataset.file = file.name;
    card.dataset.team = team;
    
    // Извлекаем превью (первые 3 строки)
    const previewLines = content.split('\n').slice(0, 3).join('\n');
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-name">${file.icon} ${file.name}</span>
            <span class="card-status ${team === 'red' ? 'red' : 'blue'}" id="status-${team}-${file.type}"></span>
        </div>
        <div class="card-description">${file.description}</div>
        <pre class="card-preview">${previewLines}</pre>
    `;
    
    return card;
}

// Запуск таймера
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endBattle();
        }
    }, 1000);
}

// Обновление таймера
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerElement = document.querySelector('.timer-value');
    if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Завершение битвы
function endBattle() {
    addLogMessage('⏰ Время вышло! Подводим итоги сражения...', 'info');
    
    const redScore = Object.values(redTeamProgress).filter(v => v).length;
    const blueScore = Object.values(blueTeamProgress).filter(v => v).length;
    
    if (redScore > blueScore) {
        addLogMessage('🏆 ПОБЕДА КРАСНОЙ БАШНИ! Красная команда создала больше таблиц!', 'success');
    } else if (blueScore > redScore) {
        addLogMessage('🏆 ПОБЕДА СИНЕЙ БАШНИ! Синяя команда создала больше таблиц!', 'success');
    } else {
        addLogMessage('🤝 НИЧЬЯ! Обе башни устояли!', 'info');
    }
}

// Выполнение SQL для красной команды
document.getElementById('executeRed').addEventListener('click', async () => {
    await executeTeamSQL('red');
});

// Выполнение SQL для синей команды
document.getElementById('executeBlue').addEventListener('click', async () => {
    await executeTeamSQL('blue');
});

// Выполнение SQL для команды
async function executeTeamSQL(team) {
    if (!SQL) {
        addLogMessage('❌ SQLite еще не загружен!', 'error');
        return;
    }
    
    try {
        // Создаем новую базу данных
        const db = new SQL.Database();
        
        // Включаем поддержку внешних ключей
        db.run("PRAGMA foreign_keys = ON;");
        
        // Загружаем SQL файлы
        const files = ['clans.sql', 'players.sql', 'cards.sql', 'battles.sql'];
        const sqls = {};
        
        for (const file of files) {
            const response = await fetch(`exercises/${file}`);
            sqls[file] = await response.text();
        }
        
        // Выполняем SQL в правильном порядке
        addLogMessage(`⚡ ${team === 'red' ? 'Красная' : 'Синяя'} башня начинает атаку!`, 'info');
        
        // Обновляем эликсир
        updateElixir(team, 25);
        
        // Выполняем clans.sql
        try {
            db.run(sqls['clans.sql']);
            updateTeamProgress(team, 'clans', true);
            addLogMessage('✅ Таблица Clans создана!', 'success');
        } catch (e) {
            updateTeamProgress(team, 'clans', false);
            addLogMessage(`❌ Ошибка в clans.sql: ${e.message}`, 'error');
        }
        
        updateElixir(team, 50);
        
        // Выполняем cards.sql (не зависит от других)
        try {
            db.run(sqls['cards.sql']);
            updateTeamProgress(team, 'cards', true);
            addLogMessage('✅ Таблица Cards создана!', 'success');
        } catch (e) {
            updateTeamProgress(team, 'cards', false);
            addLogMessage(`❌ Ошибка в cards.sql: ${e.message}`, 'error');
        }
        
        updateElixir(team, 75);
        
        // Выполняем players.sql (зависит от clans)
        try {
            db.run(sqls['players.sql']);
            updateTeamProgress(team, 'players', true);
            addLogMessage('✅ Таблица Players создана!', 'success');
        } catch (e) {
            updateTeamProgress(team, 'players', false);
            addLogMessage(`❌ Ошибка в players.sql: ${e.message}`, 'error');
        }
        
        // Выполняем battles.sql (зависит от players)
        try {
            db.run(sqls['battles.sql']);
            updateTeamProgress(team, 'battles', true);
            addLogMessage('✅ Таблица Battles создана!', 'success');
        } catch (e) {
            updateTeamProgress(team, 'battles', false);
            addLogMessage(`❌ Ошибка в battles.sql: ${e.message}`, 'error');
        }
        
        updateElixir(team, 100);
        
        // Визуализируем результаты
        visualizeDatabase(db, team);
        
        // Обновляем счет трофеев
        updateTrophies();
        
        addLogMessage(`✨ ${team === 'red' ? 'Красная' : 'Синяя'} башня завершила атаку!`, 'success');
        
    } catch (error) {
        addLogMessage(`💥 КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`, 'error');
    }
}

// Обновление прогресса команды
function updateTeamProgress(team, table, success) {
    if (team === 'red') {
        redTeamProgress[table] = success;
    } else {
        blueTeamProgress[table] = success;
    }
    
    // Обновляем статус в карточке
    const statusElement = document.getElementById(`status-${team}-${table}`);
    if (statusElement) {
        if (success) {
            statusElement.className = `card-status success`;
            statusElement.style.background = '#44ff44';
        } else {
            statusElement.className = `card-status`;
            statusElement.style.background = '#ff4444';
        }
    }
}

// Обновление эликсира
function updateElixir(team, percent) {
    const elixirBar = document.getElementById(`elixir${team === 'red' ? 'Red' : 'Blue'}`);
    if (elixirBar) {
        elixirBar.style.width = `${percent}%`;
    }
}

// Обновление трофеев
function updateTrophies() {
    const redScore = Object.values(redTeamProgress).filter(v => v).length;
    const blueScore = Object.values(blueTeamProgress).filter(v => v).length;
    
    const trophyElement = document.getElementById('trophyCounter');
    if (trophyElement) {
        trophyElement.textContent = `${redScore} - ${blueScore}`;
    }
    
    const dbStatus = document.getElementById('dbStatus');
    if (dbStatus) {
        const totalTables = redScore + blueScore;
        dbStatus.textContent = `${totalTables}/8 таблиц`;
    }
}

// Визуализация базы данных
function visualizeDatabase(db, team) {
    try {
        // Получаем список таблиц
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
        
        if (!tables.length) {
            return;
        }
        
        // Визуализируем схему
        visualizeSchema(db, tables);
        
        // Визуализируем граф связей
        visualizeGraph(db, tables);
        
        // Визуализируем данные
        visualizeData(db, tables);
        
    } catch (error) {
        console.error('Visualization error:', error);
    }
}

// Визуализация схемы
function visualizeSchema(db, tables) {
    const schemaGrid = document.getElementById('schemaGrid');
    schemaGrid.innerHTML = '';
    
    for (const table of tables[0].values) {
        const tableName = table[0];
        
        // Получаем информацию о колонках
        const tableInfo = db.exec(`PRAGMA table_info(${tableName});`);
        const foreignKeys = db.exec(`PRAGMA foreign_key_list(${tableName});`);
        
        const fkMap = {};
        if (foreignKeys.length) {
            for (const fk of foreignKeys[0].values) {
                fkMap[fk[3]] = fk[2]; // from -> to
            }
        }
        
        const card = document.createElement('div');
        card.className = 'schema-card';
        card.style.borderTopColor = getTableColor(tableName);
        
        let html = `<h4>${getTableIcon(tableName)} ${tableName}</h4>`;
        html += '<table>';
        
        for (const col of tableInfo[0].values) {
            const isPK = col[5] === 1;
            const isFK = fkMap[col[1]];
            
            html += '<tr>';
            html += `<td>${col[1]}</td>`;
            html += `<td>${col[2]}</td>`;
            html += '<td>';
            if (isPK) html += ' 🔑';
            if (isFK) html += ' 🔗';
            html += '</td>';
            html += '</tr>';
        }
        
        html += '</table>';
        card.innerHTML = html;
        schemaGrid.appendChild(card);
    }
}

// Визуализация графа связей
function visualizeGraph(db, tables) {
    const container = document.getElementById('graphContainer');
    
    const nodes = [];
    const edges = [];
    
    // Создаем узлы
    for (const table of tables[0].values) {
        const tableName = table[0];
        nodes.push({
            id: tableName,
            label: tableName,
            color: getTableColor(tableName),
            font: { color: 'white', size: 16 },
            shape: 'box',
            shadow: true
        });
        
        // Получаем внешние ключи
        const foreignKeys = db.exec(`PRAGMA foreign_key_list(${tableName});`);
        if (foreignKeys.length) {
            for (const fk of foreignKeys[0].values) {
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
}

// Визуализация данных
function visualizeData(db, tables) {
    const dataTables = document.getElementById('dataTables');
    dataTables.innerHTML = '<h3>📦 Данные в таблицах</h3>';
    
    for (const table of tables[0].values) {
        const tableName = table[0];
        
        try {
            const data = db.exec(`SELECT * FROM ${tableName} LIMIT 5;`);
            
            if (data.length && data[0].values.length) {
                const div = document.createElement('div');
                div.className = 'data-table';
                
                let html = `<h4>${getTableIcon(tableName)} ${tableName} (${data[0].values.length} записей)</h4>`;
                html += '<table><thead><tr>';
                
                // Заголовки
                for (const col of data[0].columns) {
                    html += `<th>${col}</th>`;
                }
                html += '</tr></thead><tbody>';
                
                // Данные
                for (const row of data[0].values) {
                    html += '<tr>';
                    for (const cell of row) {
                        html += `<td>${cell !== null ? cell : 'NULL'}</td>`;
                    }
                    html += '</tr>';
                }
                
                html += '</tbody></table>';
                div.innerHTML = html;
                dataTables.appendChild(div);
            }
        } catch (e) {
            // Таблица пуста или ошибка
        }
    }
}

// Добавление сообщения в лог
function addLogMessage(message, type) {
    const logMessages = document.getElementById('logMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `log-message ${type}`;
    messageElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    logMessages.appendChild(messageElement);
    logMessages.scrollTop = logMessages.scrollHeight;
    
    battleLog.push({ message, type, timestamp: new Date() });
}

// Очистка лога
window.clearLog = function() {
    const logMessages = document.getElementById('logMessages');
    logMessages.innerHTML = '';
    battleLog = [];
    addLogMessage('🧹 Лог очищен', 'info');
};

// Получение цвета таблицы
function getTableColor(tableName) {
    const colors = {
        'Clans': '#ffd700',
        'Players': '#4ecdc4',
        'Cards': '#ffe66d',
        'Battles': '#ff6b6b'
    };
    return colors[tableName] || '#95a5a6';
}

// Получение иконки таблицы
function getTableIcon(tableName) {
    const icons = {
        'Clans': '🏰',
        'Players': '👑',
        'Cards': '🃏',
        'Battles': '⚔️'
    };
    return icons[tableName] || '📋';
}

// Переключение табов
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Убираем активный класс у всех
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        // Активируем выбранный
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(tabId + 'View').classList.add('active');
    });
});
