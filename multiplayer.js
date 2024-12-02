class MultiplayerManager {
    constructor() {
        this.ws = null;
        this.roomId = null;
        this.playerId = null;
        this.players = new Map();
        this.maxPlayers = 5;
        this.setupUI();
    }

    setupUI() {
        const multiplayerUI = document.createElement('div');
        multiplayerUI.id = 'multiplayer-ui';
        multiplayerUI.innerHTML = `
            <div id="multiplayer-menu" class="menu">
                <h2>اللعب الجماعي (5 لاعبين)</h2>
                <div class="room-status">اللاعبون: <span id="player-count">0/${this.maxPlayers}</span></div>
                <div id="create-game">
                    <input type="text" id="player-name" placeholder="اسمك في اللعبة">
                    <button id="create-room">إنشاء غرفة جديدة</button>
                </div>
                <div id="join-game">
                    <input type="text" id="room-code" placeholder="رمز الغرفة">
                    <button id="join-room">انضم إلى غرفة</button>
                </div>
            </div>
            <div id="in-game-ui" class="hidden">
                <div id="players-list"></div>
                <div id="chat">
                    <div id="chat-messages"></div>
                    <input type="text" id="chat-input" placeholder="اكتب رسالة...">
                </div>
            </div>
        `;
        document.body.appendChild(multiplayerUI);

        // إضافة الأنماط
        const style = document.createElement('style');
        style.textContent = `
            #multiplayer-ui {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                padding: 15px;
                border-radius: 10px;
                color: white;
                direction: rtl;
            }
            .menu input, .menu button {
                display: block;
                margin: 10px 0;
                padding: 8px;
                width: 100%;
            }
            #players-list {
                margin-bottom: 10px;
            }
            #chat {
                width: 300px;
                height: 400px;
            }
            #chat-messages {
                height: 350px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.5);
                margin-bottom: 10px;
                padding: 10px;
            }
            #chat-input {
                width: 100%;
                padding: 8px;
            }
            .hidden {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('create-room').onclick = () => this.createRoom();
        document.getElementById('join-room').onclick = () => this.joinRoom();
        document.getElementById('chat-input').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendChatMessage(e.target.value);
        };
    }

    connect() {
        this.ws = new WebSocket('ws://localhost:8080');
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
        };

        this.ws.onclose = () => {
            console.log('اتصال مقطوع. جاري إعادة الاتصال...');
            setTimeout(() => this.connect(), 3000);
        };
    }

    createRoom() {
        const playerName = document.getElementById('player-name').value;
        if (!playerName) return alert('الرجاء إدخال اسمك');

        this.ws.send(JSON.stringify({
            type: 'createRoom',
            playerName: playerName
        }));
    }

    joinRoom() {
        const playerName = document.getElementById('player-name').value;
        const roomCode = document.getElementById('room-code').value;
        if (!playerName || !roomCode) return alert('الرجاء إدخال جميع المعلومات');

        this.ws.send(JSON.stringify({
            type: 'joinRoom',
            playerName: playerName,
            roomId: roomCode
        }));
    }

    handleServerMessage(data) {
        switch(data.type) {
            case 'roomCreated':
            case 'roomJoined':
                this.roomId = data.roomId;
                document.getElementById('multiplayer-menu').classList.add('hidden');
                document.getElementById('in-game-ui').classList.remove('hidden');
                break;

            case 'roomState':
                this.updatePlayersUI(data.players);
                this.updateGameState(data.gameState);
                break;

            case 'chat':
                this.addChatMessage(data.playerName, data.message);
                break;

            case 'emote':
                // عرض رقصة لاعب آخر
                const player = this.players.get(data.playerId);
                if (player && player.emoteSystem) {
                    player.emoteSystem.playEmote(data.emoteKey);
                }
                break;
        }
    }

    updatePlayersUI(players) {
        const list = document.getElementById('players-list');
        list.innerHTML = '<h3>اللاعبون:</h3>';
        players.forEach(player => {
            const div = document.createElement('div');
            div.textContent = player.name;
            list.appendChild(div);
        });
        document.getElementById('player-count').textContent = `${players.length}/${this.maxPlayers}`;
    }

    updateGameState(gameState) {
        // تحديث حالة اللعبة (الموارد، الأعداء، إلخ)
        game.updateMultiplayerState(gameState);
    }

    sendChatMessage(message) {
        if (!message) return;
        
        this.ws.send(JSON.stringify({
            type: 'chat',
            roomId: this.roomId,
            message: message
        }));

        document.getElementById('chat-input').value = '';
    }

    addChatMessage(playerName, message) {
        const chat = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.textContent = `${playerName}: ${message}`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    updatePosition(position) {
        if (this.ws && this.roomId) {
            this.ws.send(JSON.stringify({
                type: 'updatePosition',
                position: position
            }));
        }
    }

    updateGameState(gameState) {
        if (this.ws && this.roomId) {
            this.ws.send(JSON.stringify({
                type: 'updateGameState',
                roomId: this.roomId,
                gameState: gameState
            }));
        }
    }

    broadcastEmote(emoteKey) {
        if (this.ws && this.roomId) {
            this.ws.send(JSON.stringify({
                type: 'emote',
                roomId: this.roomId,
                emoteKey: emoteKey
            }));
        }
    }
}
