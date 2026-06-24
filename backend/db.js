const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.join(__dirname, 'scores.json');

// Если файла нет – создаём с пустым массивом
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}

// Сохранение рекорда
function saveScore(playerName, score) {
    return new Promise((resolve, reject) => {
        try {
            const data = fs.readFileSync(SCORES_FILE, 'utf8');
            let scores = JSON.parse(data);
            scores.push({ 
                player_name: playerName, 
                score, 
                created_at: new Date().toISOString() 
            });
            fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
            resolve(scores.length); // возвращаем индекс как ID
        } catch (err) {
            reject(err);
        }
    });
}

// Получение топ-10
function getTopScores(limit = 10) {
    return new Promise((resolve, reject) => {
        try {
            const data = fs.readFileSync(SCORES_FILE, 'utf8');
            let scores = JSON.parse(data);
            scores.sort((a, b) => b.score - a.score);
            resolve(scores.slice(0, limit));
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { saveScore, getTopScores };