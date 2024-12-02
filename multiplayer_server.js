const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// إنشاء خادم WebSocket
const wss = new WebSocket.Server({ port: 8080 });

// تخزين معلومات الغرف واللاعبين
const rooms = new Map();
const players = new Map();

class GameRoom {
    constructor(id, host) {
        this.id = id;
        this.host = host;
        this.players = new Map();
        this.maxPlayers = 5; // تحديث عدد اللاعبين الأقصى إلى 5
        this.gameState = {
            resources: [],
            enemies: [],
            rafts: new Map()
        };
    }

    addPlayer(player) {
        if (this.players.size >= this.maxPlayers) {
            return false; // الغرفة ممتلئة
        }
        this.players.set(player.id, player);
        this.broadcastRoomState();
        
        // إرسال رسالة ترحيب
        this.broadcast(JSON.stringify({
            type: 'chat',
            playerId: 'system',
            playerName: 'النظام',
            message: `${player.name} انضم إلى اللعبة (${this.players.size}/${this.maxPlayers})`
        }));
        
        return true;
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.broadcastRoomState();
        
        // إرسال رسالة وداع
        this.broadcast(JSON.stringify({
            type: 'chat',
            playerId: 'system',
            playerName: 'النظام',
            message: `اللاعب ${players.get(playerId).name} غادر اللعبة (${this.players.size}/${this.maxPlayers})`
        }));
    }

    broadcastRoomState() {
        const state = {
            type: 'roomState',
            players: Array.from(this.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                position: p.position
            })),
            gameState: this.gameState
        };
        
        this.broadcast(JSON.stringify(state));
    }

    broadcast(message, exclude = null) {
        this.players.forEach(player => {
            if (player.id !== exclude && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(message);
            }
        });
    }
}

// معالجة اتصالات اللاعبين
wss.on('connection', (ws) => {
    const playerId = uuidv4();
    console.log(`لاعب جديد اتصل: ${playerId}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch(data.type) {
            case 'createRoom':
                const roomId = uuidv4();
                const newRoom = new GameRoom(roomId, playerId);
                rooms.set(roomId, newRoom);
                players.set(playerId, {
                    id: playerId,
                    name: data.playerName,
                    ws: ws,
                    position: { x: 0, y: 0, z: 0 },
                    roomId: roomId
                });
                if (!newRoom.addPlayer(players.get(playerId))) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'الغرفة ممتلئة'
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'roomCreated',
                        roomId: roomId
                    }));
                }
                break;

            case 'joinRoom':
                const room = rooms.get(data.roomId);
                if (room) {
                    players.set(playerId, {
                        id: playerId,
                        name: data.playerName,
                        ws: ws,
                        position: { x: 0, y: 0, z: 0 },
                        roomId: data.roomId
                    });
                    if (!room.addPlayer(players.get(playerId))) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'الغرفة ممتلئة'
                        }));
                    } else {
                        ws.send(JSON.stringify({
                            type: 'roomJoined',
                            roomId: data.roomId
                        }));
                    }
                }
                break;

            case 'updatePosition':
                const player = players.get(playerId);
                if (player) {
                    player.position = data.position;
                    const playerRoom = rooms.get(player.roomId);
                    if (playerRoom) {
                        playerRoom.broadcastRoomState();
                    }
                }
                break;

            case 'updateGameState':
                const currentRoom = rooms.get(data.roomId);
                if (currentRoom && currentRoom.host === playerId) {
                    currentRoom.gameState = data.gameState;
                    currentRoom.broadcastRoomState();
                }
                break;

            case 'chat':
                const chatRoom = rooms.get(data.roomId);
                if (chatRoom) {
                    chatRoom.broadcast(JSON.stringify({
                        type: 'chat',
                        playerId: playerId,
                        playerName: players.get(playerId).name,
                        message: data.message
                    }));
                }
                break;
        }
    });

    ws.on('close', () => {
        const player = players.get(playerId);
        if (player) {
            const room = rooms.get(player.roomId);
            if (room) {
                room.removePlayer(playerId);
                if (room.players.size === 0) {
                    rooms.delete(player.roomId);
                }
            }
            players.delete(playerId);
        }
    });
});
