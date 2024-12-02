const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

// تهيئة التطبيق
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// إعدادات الأمان والضغط
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "wss:", "https:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));
app.use(compression());
app.use(express.json());

// المتغيرات العامة
const TICK_RATE = 60;
const players = new Map();
const gameState = {
    players: {},
    world: {
        time: 0,
        weather: 'clear',
        events: []
    }
};

// معالجة الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// توجيهات API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        players: players.size,
        uptime: process.uptime()
    });
});

app.post('/api/login', (req, res) => {
    const playerId = uuidv4();
    res.json({
        id: playerId,
        token: generateToken(playerId)
    });
});

// معالجة اتصالات WebSocket
wss.on('connection', (ws) => {
    const playerId = uuidv4();
    players.set(playerId, {
        id: playerId,
        ws,
        state: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            health: 100,
            inventory: []
        }
    });

    console.log(`لاعب جديد متصل: ${playerId}`);

    // إرسال حالة اللعبة الأولية
    ws.send(JSON.stringify({
        type: 'init',
        data: {
            id: playerId,
            gameState
        }
    }));

    // معالجة رسائل اللاعب
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handlePlayerMessage(playerId, data);
        } catch (error) {
            console.error('خطأ في معالجة رسالة اللاعب:', error);
        }
    });

    // معالجة قطع الاتصال
    ws.on('close', () => {
        console.log(`لاعب غادر: ${playerId}`);
        players.delete(playerId);
        broadcastGameState();
    });
});

// وظائف المساعدة
function handlePlayerMessage(playerId, message) {
    const player = players.get(playerId);
    if (!player) return;

    switch (message.type) {
        case 'move':
            updatePlayerPosition(playerId, message.data);
            break;
        case 'action':
            handlePlayerAction(playerId, message.data);
            break;
        case 'chat':
            broadcastChat(playerId, message.data);
            break;
    }
}

function updatePlayerPosition(playerId, position) {
    const player = players.get(playerId);
    if (player) {
        player.state.position = position;
        broadcastGameState();
    }
}

function handlePlayerAction(playerId, action) {
    const player = players.get(playerId);
    if (!player) return;

    switch (action.type) {
        case 'attack':
            handleAttack(playerId, action.target);
            break;
        case 'collect':
            handleCollection(playerId, action.item);
            break;
        case 'build':
            handleBuilding(playerId, action.structure);
            break;
    }
}

function broadcastGameState() {
    const state = {
        players: Array.from(players.values()).map(p => ({
            id: p.id,
            position: p.state.position,
            rotation: p.state.rotation,
            health: p.state.health
        })),
        world: gameState.world
    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'state_update',
                data: state
            }));
        }
    });
}

function broadcastChat(playerId, message) {
    const player = players.get(playerId);
    if (!player) return;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'chat',
                data: {
                    playerId,
                    message
                }
            }));
        }
    });
}

function generateToken(playerId) {
    // هنا يمكنك إضافة منطق توليد التوكن الخاص بك
    return Buffer.from(`${playerId}-${Date.now()}`).toString('base64');
}

// تحديث حالة اللعبة
setInterval(() => {
    gameState.world.time += 1/TICK_RATE;
    updateWorldState();
    broadcastGameState();
}, 1000/TICK_RATE);

function updateWorldState() {
    // تحديث الطقس
    if (Math.random() < 0.001) {
        gameState.world.weather = ['clear', 'rain', 'storm'][Math.floor(Math.random() * 3)];
    }

    // تحديث الأحداث
    updateGameEvents();
}

function updateGameEvents() {
    // إضافة أحداث عشوائية
    if (Math.random() < 0.05) {
        gameState.world.events.push({
            id: uuidv4(),
            type: 'random_event',
            data: generateRandomEvent()
        });
    }

    // إزالة الأحداث القديمة
    gameState.world.events = gameState.world.events.filter(e => e.timestamp > Date.now() - 60000);
}

function generateRandomEvent() {
    const events = [
        { type: 'resource_spawn', data: { resource: 'wood', amount: 10 } },
        { type: 'enemy_spawn', data: { enemy: 'zombie', count: 3 } },
        { type: 'treasure', data: { type: 'chest', rewards: ['gold', 'weapon'] } }
    ];
    return events[Math.floor(Math.random() * events.length)];
}

// معالجة الأخطاء
process.on('uncaughtException', (error) => {
    console.error('خطأ غير معالج:', error);
    // هنا يمكنك إضافة منطق إعادة تشغيل السيرفر أو إرسال إشعار
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('وعد مرفوض غير معالج:', reason);
});

// بدء السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`السيرفر يعمل على المنفذ ${PORT}`);
});
