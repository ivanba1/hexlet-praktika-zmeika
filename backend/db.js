const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, 'scores.json');

// Функция для безопасного чтения файла
function readScores() {
    try {
        // Проверяем, существует ли файл
        if (!fs.existsSync(SCORES_FILE)) {
            // Если нет — создаём с пустым массивом
            fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
            return [];
        }

        // Читаем файл
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        
        // Если файл пустой — возвращаем пустой массив
        if (!data || data.trim() === '') {
            fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
            return [];
        }

        // Пытаемся парсить JSON
        return JSON.parse(data);
    } catch (err) {
        // Если JSON повреждён — пересоздаём файл
        console.error('Ошибка чтения scores.json, создаём новый:', err.message);
        fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
        return [];
    }
}

// Функция для безопасной записи
function writeScores(scores) {
    try {
        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
    } catch (err) {
        console.error('Ошибка записи scores.json:', err.message);
        throw err;
    }
}

// Сохранение рекорда
async function saveScore(playerName, score) {
    return new Promise((resolve, reject) => {
        try {
            const scores = readScores();
            const newRecord = {
                player_name: playerName,
                score: score,
                created_at: new Date().toISOString()
            };
            scores.push(newRecord);
            writeScores(scores);
            resolve(scores.length);
        } catch (err) {
            reject(err);
        }
    });
}

// Получение топ-10
async function getTopScores(limit = 10) {
    return new Promise((resolve, reject) => {
        try {
            const scores = readScores();
            // Сортируем по убыванию счёта
            scores.sort((a, b) => b.score - a.score);
            resolve(scores.slice(0, limit));
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { saveScore, getTopScores };
