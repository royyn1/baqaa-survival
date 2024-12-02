// نظام التكامل مع الخادم الرئيسي

class GameIntegration {
    constructor() {
        this.connectionState = {
            connected: false,
            lastSync: null,
            syncInterval: 5000 // 5 seconds
        };
        
        this.config = {
            mainServer: 'wss://api.baqaa.game/ws',
            httpEndpoint: 'https://api.baqaa.game/api',
            gameId: crypto.randomUUID()
        };

        this.init();
    }

    async init() {
        await this.connectToMainServer();
        this.setupSyncLoop();
        this.handleServerMessages();
    }

    async connectToMainServer() {
        try {
            this.ws = new WebSocket(this.config.mainServer);
            
            this.ws.onopen = () => {
                this.connectionState.connected = true;
                this.sendInitialState();
            };

            this.ws.onclose = () => {
                this.connectionState.connected = false;
                setTimeout(() => this.connectToMainServer(), 5000);
            };

            this.ws.onerror = (error) => {
                console.error('خطأ في الاتصال:', error);
                this.handleConnectionError(error);
            };

        } catch (error) {
            console.error('فشل الاتصال بالخادم:', error);
        }
    }

    async sendInitialState() {
        const gameState = {
            gameId: this.config.gameId,
            version: window.game.version,
            environment: {
                platform: navigator.platform,
                userAgent: navigator.userAgent,
                language: navigator.language
            },
            capabilities: {
                webgl: this.checkWebGLSupport(),
                audio: this.checkAudioSupport(),
                storage: await this.checkStorageSupport()
            }
        };

        this.sendToServer('init', gameState);
    }

    setupSyncLoop() {
        setInterval(() => {
            if (this.connectionState.connected) {
                this.syncWithServer();
            }
        }, this.connectionState.syncInterval);
    }

    async syncWithServer() {
        const updateData = {
            gameId: this.config.gameId,
            timestamp: Date.now(),
            metrics: this.collectMetrics(),
            events: this.collectEvents(),
            state: this.getGameState()
        };

        try {
            const response = await fetch(`${this.config.httpEndpoint}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const serverUpdates = await response.json();
                this.applyServerUpdates(serverUpdates);
                this.connectionState.lastSync = Date.now();
            }
        } catch (error) {
            console.error('خطأ في المزامنة:', error);
        }
    }

    handleServerMessages() {
        this.ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'update':
                    await this.handleGameUpdate(message.data);
                    break;
                case 'command':
                    await this.executeServerCommand(message.data);
                    break;
                case 'sync_request':
                    await this.handleSyncRequest(message.data);
                    break;
                case 'error':
                    this.handleServerError(message.data);
                    break;
            }
        };
    }

    async handleGameUpdate(updateData) {
        try {
            // تحديث محتوى اللعبة
            if (updateData.content) {
                await this.updateGameContent(updateData.content);
            }

            // تحديث إعدادات اللعبة
            if (updateData.settings) {
                this.updateGameSettings(updateData.settings);
            }

            // تحديث نظام الذكاء الاصطناعي
            if (updateData.ai) {
                await this.updateAISystem(updateData.ai);
            }

            // إرسال تأكيد التحديث
            this.sendToServer('update_confirmation', {
                updateId: updateData.id,
                status: 'success'
            });

        } catch (error) {
            console.error('خطأ في تطبيق التحديث:', error);
            this.sendToServer('update_confirmation', {
                updateId: updateData.id,
                status: 'error',
                error: error.message
            });
        }
    }

    async executeServerCommand(command) {
        try {
            switch (command.action) {
                case 'restart':
                    await this.restartGame();
                    break;
                case 'update_ai':
                    await this.updateAI(command.data);
                    break;
                case 'collect_metrics':
                    await this.collectAndSendMetrics();
                    break;
                case 'debug_mode':
                    this.toggleDebugMode(command.enabled);
                    break;
            }

            this.sendToServer('command_response', {
                commandId: command.id,
                status: 'success'
            });
        } catch (error) {
            this.sendToServer('command_response', {
                commandId: command.id,
                status: 'error',
                error: error.message
            });
        }
    }

    sendToServer(type, data) {
        if (this.connectionState.connected) {
            this.ws.send(JSON.stringify({
                type,
                data,
                timestamp: Date.now()
            }));
        }
    }

    async updateGameContent(content) {
        // تحديث الموارد
        if (content.resources) {
            await this.updateResources(content.resources);
        }

        // تحديث المراحل
        if (content.levels) {
            await this.updateLevels(content.levels);
        }

        // تحديث العناصر
        if (content.items) {
            await this.updateItems(content.items);
        }
    }

    async updateResources(resources) {
        for (const resource of resources) {
            try {
                const response = await fetch(resource.url);
                const data = await response.blob();
                await this.saveResource(resource.id, data);
            } catch (error) {
                console.error(`فشل تحديث المورد ${resource.id}:`, error);
            }
        }
    }

    updateGameSettings(settings) {
        // تحديث إعدادات الرسومات
        if (settings.graphics) {
            window.game.graphics.updateSettings(settings.graphics);
        }

        // تحديث إعدادات الصوت
        if (settings.audio) {
            window.game.audio.updateSettings(settings.audio);
        }

        // تحديث إعدادات اللعب
        if (settings.gameplay) {
            window.game.updateGameplaySettings(settings.gameplay);
        }
    }

    collectMetrics() {
        return {
            performance: this.getPerformanceMetrics(),
            gameplay: this.getGameplayMetrics(),
            errors: this.getErrorMetrics()
        };
    }

    getPerformanceMetrics() {
        return {
            fps: this.calculateFPS(),
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize
            } : null,
            loadTimes: this.getResourceLoadTimes()
        };
    }

    calculateFPS() {
        // حساب معدل الإطارات في الثانية
        return window.game.renderer.info.render.fps;
    }
}

export default GameIntegration;
