const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { saveScore, getTopScores } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// РАЗДАЧА СТАТИКИ (ВАЖНО!)
app.use(express.static(path.join(__dirname, '../frontend')));

// API: сохранить рекорд
app.post('/api/scores', async (req, res) => {
    const { playerName, score } = req.body;
    if (!playerName || typeof score !== 'number') {
        return res.status(400).json({ error: 'Неверные данные' });
    }
    try {
        const id = await saveScore(playerName, score);
        res.json({ id, message: 'Рекорд сохранён' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// API: получить топ-10
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await getTopScores(10);
        res.json(scores);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// Если запрос не совпадает ни с одним маршрутом — отдаём index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
