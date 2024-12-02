class EmoteSystem {
    constructor(player) {
        this.player = player;
        this.currentEmote = null;
        this.emoteTimer = null;
        
        // قائمة الرقصات المتاحة
        this.emotes = {
            dance1: {
                name: "رقصة النصر",
                duration: 3000,
                animation: [
                    { rotation: { x: 0, y: 0, z: 0 }, position: { y: 0 } },
                    { rotation: { x: 0, y: 180, z: 0 }, position: { y: 1 } },
                    { rotation: { x: 0, y: 360, z: 0 }, position: { y: 0 } }
                ]
            },
            dance2: {
                name: "رقصة الفرح",
                duration: 2500,
                animation: [
                    { rotation: { x: 0, y: 0, z: 0 }, position: { y: 0 } },
                    { rotation: { x: 45, y: 0, z: 0 }, position: { y: 0.5 } },
                    { rotation: { x: 0, y: 0, z: 0 }, position: { y: 0 } }
                ]
            },
            dance3: {
                name: "رقصة التحدي",
                duration: 2000,
                animation: [
                    { rotation: { x: 0, y: 0, z: 0 }, position: { y: 0 } },
                    { rotation: { x: 0, y: 90, z: 0 }, position: { y: 0.3 } },
                    { rotation: { x: 0, y: 180, z: 0 }, position: { y: 0 } },
                    { rotation: { x: 0, y: 270, z: 0 }, position: { y: 0.3 } },
                    { rotation: { x: 0, y: 360, z: 0 }, position: { y: 0 } }
                ]
            },
            dance4: {
                name: "رقصة السباحة",
                duration: 3500,
                animation: [
                    { rotation: { x: 0, y: 0, z: 0 }, position: { y: 0 } },
                    { rotation: { x: 0, y: 0, z: 45 }, position: { y: 0.2 } },
                    { rotation: { x: 0, y: 0, z: -45 }, position: { y: 0.2 } },
                    { rotation: { x: 0, y: 0, z: 0 }, position: { y: 0 } }
                ]
            },
            dance5: {
                name: "رقصة البناء",
                duration: 2800,
                animation: [
                    { rotation: { x: 0, y: 0, z: 0 }, position: { y: 0 } },
                    { rotation: { x: 30, y: 0, z: 0 }, position: { y: 0.4 } },
                    { rotation: { x: -30, y: 0, z: 0 }, position: { y: 0.4 } },
                    { rotation: { x: 0, y: 0, z: 0 }, position: { y: 0 } }
                ]
            }
        };

        this.setupEmoteUI();
    }

    setupEmoteUI() {
        const emoteUI = document.createElement('div');
        emoteUI.id = 'emote-ui';
        emoteUI.innerHTML = `
            <div class="emote-wheel hidden">
                ${Object.entries(this.emotes).map(([key, emote]) => `
                    <div class="emote-item" data-emote="${key}">
                        <span class="emote-name">${emote.name}</span>
                    </div>
                `).join('')}
            </div>
            <button id="emote-button">رقصات 🎭</button>
        `;
        document.body.appendChild(emoteUI);

        // إضافة الأنماط
        const style = document.createElement('style');
        style.textContent = `
            #emote-ui {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            #emote-button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .emote-wheel {
                position: absolute;
                bottom: 60px;
                right: 0;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 10px;
                padding: 10px;
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .emote-item {
                background: rgba(255, 255, 255, 0.1);
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
                text-align: center;
                color: white;
                transition: background 0.3s;
            }
            
            .emote-item:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .hidden {
                display: none;
            }
        `;
        document.head.appendChild(style);

        this.bindEmoteEvents();
    }

    bindEmoteEvents() {
        const emoteButton = document.getElementById('emote-button');
        const emoteWheel = document.querySelector('.emote-wheel');

        emoteButton.addEventListener('click', () => {
            emoteWheel.classList.toggle('hidden');
        });

        document.querySelectorAll('.emote-item').forEach(item => {
            item.addEventListener('click', () => {
                const emoteKey = item.dataset.emote;
                this.playEmote(emoteKey);
                emoteWheel.classList.add('hidden');
            });
        });

        // إغلاق عجلة الرقصات عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!emoteWheel.contains(e.target) && e.target !== emoteButton) {
                emoteWheel.classList.add('hidden');
            }
        });
    }

    playEmote(emoteKey) {
        if (this.currentEmote) {
            clearTimeout(this.emoteTimer);
        }

        const emote = this.emotes[emoteKey];
        if (!emote) return;

        this.currentEmote = emoteKey;
        
        // إرسال الرقصة للاعبين الآخرين في اللعب الجماعي
        if (window.multiplayerManager) {
            window.multiplayerManager.broadcastEmote(emoteKey);
        }

        // تشغيل الرقصة
        let step = 0;
        const animate = () => {
            if (step >= emote.animation.length) {
                step = 0;
            }

            const frame = emote.animation[step];
            this.applyEmoteFrame(frame);

            step++;
            
            if (step < emote.animation.length) {
                requestAnimationFrame(animate);
            } else {
                // إعادة اللاعب إلى وضعه الطبيعي
                this.resetPlayerPosition();
            }
        };

        animate();
        
        // إيقاف الرقصة بعد المدة المحددة
        this.emoteTimer = setTimeout(() => {
            this.currentEmote = null;
            this.resetPlayerPosition();
        }, emote.duration);
    }

    applyEmoteFrame(frame) {
        // تطبيق الحركة على نموذج اللاعب
        if (frame.rotation) {
            this.player.rotation.x = THREE.MathUtils.degToRad(frame.rotation.x);
            this.player.rotation.y = THREE.MathUtils.degToRad(frame.rotation.y);
            this.player.rotation.z = THREE.MathUtils.degToRad(frame.rotation.z);
        }
        
        if (frame.position) {
            this.player.position.y = this.player.initialY + frame.position.y;
        }
    }

    resetPlayerPosition() {
        // إعادة اللاعب إلى وضعه الطبيعي
        this.player.rotation.set(0, 0, 0);
        this.player.position.y = this.player.initialY;
    }
}
