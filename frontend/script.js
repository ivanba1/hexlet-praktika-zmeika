//Настройки
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('scoreDisplay');

const GRID_SIZE = 20;
const TICK_INTERVAL = 130;

//API
const API_URL = 'http://localhost:5000/api/scores';

//Переменные состояния
let snake = [];
let foodX = 0, foodY = 0;
let dx = 0, dy = 0;
let score = 0;
let changingDirection = false;
let gameOver = false;
let gameInterval = null;

//Инициализация
function initGame() {
    const startX = Math.floor(canvas.width / GRID_SIZE / 2) * GRID_SIZE;
    const startY = Math.floor(canvas.height / GRID_SIZE / 2) * GRID_SIZE;
    snake = [];
    for (let i = 0; i < 5; i++) {
        snake.push({ x: startX - i * GRID_SIZE, y: startY });
    }
    dx = GRID_SIZE;
    dy = 0;
    score = 0;
    gameOver = false;
    changingDirection = false;
    updateScore();
    generateFood();
    drawAll();
}

function generateFood() {
    const maxX = canvas.width - GRID_SIZE;
    const maxY = canvas.height - GRID_SIZE;
    let newX, newY;
    let onSnake;
    do {
        newX = Math.floor(Math.random() * (maxX / GRID_SIZE + 1)) * GRID_SIZE;
        newY = Math.floor(Math.random() * (maxY / GRID_SIZE + 1)) * GRID_SIZE;
        onSnake = snake.some(part => part.x === newX && part.y === newY);
    } while (onSnake);
    foodX = newX;
    foodY = newY;
}

function drawAll() {
    clearCanvas();
    drawSnake();
    drawFood();
}

function clearCanvas() {
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = (index === 0);
        ctx.fillStyle = isHead ? '#4ade80' : '#22c55e';
        ctx.shadowColor = isHead ? '#86efac' : '#166534';
        ctx.shadowBlur = 8;
        ctx.fillRect(part.x + 1, part.y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        ctx.shadowBlur = 0;
        if (isHead) {
            ctx.fillStyle = '#1e293b';
            const eyeSize = 3;
            let ex1, ey1, ex2, ey2;
            if (dx === GRID_SIZE) {
                ex1 = part.x + 12; ey1 = part.y + 4;
                ex2 = part.x + 12; ey2 = part.y + 12;
            } else if (dx === -GRID_SIZE) {
                ex1 = part.x + 4; ey1 = part.y + 4;
                ex2 = part.x + 4; ey2 = part.y + 12;
            } else if (dy === -GRID_SIZE) {
                ex1 = part.x + 4; ey1 = part.y + 4;
                ex2 = part.x + 12; ey2 = part.y + 4;
            } else {
                ex1 = part.x + 4; ey1 = part.y + 12;
                ex2 = part.x + 12; ey2 = part.y + 12;
            }
            ctx.beginPath();
            ctx.arc(ex1, ey1, eyeSize, 0, 2 * Math.PI);
            ctx.arc(ex2, ey2, eyeSize, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

function drawFood() {
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(foodX + GRID_SIZE / 2, foodY + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(foodX + 6, foodY + 6, 3, 0, 2 * Math.PI);
    ctx.fill();
}

function updateScore() {
    scoreSpan.textContent = score;
}

function advanceSnake() {
    if (gameOver) return;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    const didEat = (snake[0].x === foodX && snake[0].y === foodY);
    if (didEat) {
        score += 10;
        updateScore();
        generateFood();
    } else {
        snake.pop();
    }
    changingDirection = false;
}

function didGameEnd() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    const head = snake[0];
    return (head.x < 0 || head.x >= canvas.width ||
            head.y < 0 || head.y >= canvas.height);
}

function tick() {
    if (gameOver) return;

    advanceSnake();

    if (didGameEnd()) {
        gameOver = true;
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        drawAll();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 36px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀 Игра окончена', canvas.width / 2, canvas.height / 2);

        const playerName = prompt('Введите ваше имя для сохранения рекорда:') || 'Аноним';
        submitScore(playerName, score).then(() => {
            showScores();
        });
        return;
    }

    drawAll();
}

function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(tick, TICK_INTERVAL);
}

function changeDirection(event) {
    if (gameOver || changingDirection) return;
    const key = event.key;
    const goingUp = dy === -GRID_SIZE;
    const goingDown = dy === GRID_SIZE;
    const goingLeft = dx === -GRID_SIZE;
    const goingRight = dx === GRID_SIZE;

    let newDx = 0, newDy = 0;
    if (key === 'ArrowUp' && !goingDown) { newDx = 0; newDy = -GRID_SIZE; }
    else if (key === 'ArrowDown' && !goingUp) { newDx = 0; newDy = GRID_SIZE; }
    else if (key === 'ArrowLeft' && !goingRight) { newDx = -GRID_SIZE; newDy = 0; }
    else if (key === 'ArrowRight' && !goingLeft) { newDx = GRID_SIZE; newDy = 0; }
    else return;

    dx = newDx;
    dy = newDy;
    changingDirection = true;
}

function restartGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    initGame();
    startGame();
}

//API
async function submitScore(playerName, score) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName, score })
        });
        if (!response.ok) throw new Error('Ошибка сохранения');
        const data = await response.json();
        console.log('Рекорд сохранён:', data);
        return true;
    } catch (err) {
        console.error('Не удалось сохранить рекорд:', err);
        return false;
    }
}

async function fetchTopScores() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка получения');
        return await response.json();
    } catch (err) {
        console.error('Не удалось получить рекорды:', err);
        return [];
    }
}

async function showScores() {
    const scores = await fetchTopScores();
    if (scores.length === 0) {
        alert('Пока нет рекордов. Сыграйте и установите новый!');
        return;
    }
    const message = '🏆 Топ-10 рекордов:\n' + scores.map((s, i) =>
        `${i+1}. ${s.player_name} — ${s.score} (${new Date(s.created_at).toLocaleDateString()})`
    ).join('\n');
    alert(message);
}

//Инициализация после загрузки
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, привязываем обработчики');

    document.addEventListener('keydown', changeDirection);

    // Кнопка перезапуска
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
        console.log('✅ Кнопка перезапуска привязана');
    } else {
        console.error('❌ Кнопка перезапуска не найдена!');
    }

    // Кнопка рекордов
    const scoresBtn = document.getElementById('scoresBtn');
    if (scoresBtn) {
        scoresBtn.addEventListener('click', function() {
            console.log('Клик по кнопке Рекорды');
            showScores();
        });
        console.log('✅ Кнопка рекордов привязана');
    } else {
        console.error('❌ Кнопка рекордов не найдена!');
    }

    initGame();
    startGame();
    console.log('🎮 Игра запущена');
});