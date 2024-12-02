class CharacterSystem {
    constructor() {
        this.characters = {
            // الشخصيات الأساسية
            survivor1: {
                name: "المستكشف",
                model: "models/survivor1.glb",
                description: "شخصية متوازنة، جيدة في البقاء والقتال",
                stats: {
                    strength: 7,
                    speed: 7,
                    stamina: 7
                }
            },
            survivor2: {
                name: "الصياد",
                model: "models/survivor2.glb",
                description: "خبير في الصيد وجمع الموارد",
                stats: {
                    strength: 8,
                    speed: 6,
                    stamina: 7
                }
            },
            survivor3: {
                name: "المهندس",
                model: "models/survivor3.glb",
                description: "متخصص في البناء والتطوير",
                stats: {
                    strength: 6,
                    speed: 6,
                    stamina: 8
                }
            },
            survivor4: {
                name: "المقاتل",
                model: "models/survivor4.glb",
                description: "خبير في القتال والدفاع",
                stats: {
                    strength: 9,
                    speed: 7,
                    stamina: 5
                }
            },
            survivor5: {
                name: "الطبيب",
                model: "models/survivor5.glb",
                description: "متخصص في العلاج والبقاء",
                stats: {
                    strength: 5,
                    speed: 7,
                    stamina: 9
                }
            }
        };

        // خيارات التخصيص
        this.customizationOptions = {
            skin: [
                { id: 'skin1', name: 'فاتح', color: '#FFE0BD' },
                { id: 'skin2', name: 'متوسط', color: '#D4A373' },
                { id: 'skin3', name: 'غامق', color: '#8B4513' }
            ],
            hair: [
                { id: 'hair1', name: 'قصير', model: 'models/hair1.glb' },
                { id: 'hair2', name: 'متوسط', model: 'models/hair2.glb' },
                { id: 'hair3', name: 'طويل', model: 'models/hair3.glb' }
            ],
            hairColor: [
                { id: 'black', name: 'أسود', color: '#000000' },
                { id: 'brown', name: 'بني', color: '#8B4513' },
                { id: 'blonde', name: 'أشقر', color: '#FFD700' },
                { id: 'red', name: 'أحمر', color: '#8B0000' }
            ],
            clothes: [
                { id: 'outfit1', name: 'ملابس بقاء', model: 'models/outfit1.glb' },
                { id: 'outfit2', name: 'درع خفيف', model: 'models/outfit2.glb' },
                { id: 'outfit3', name: 'درع ثقيل', model: 'models/outfit3.glb' }
            ],
            accessories: [
                { id: 'acc1', name: 'نظارات', model: 'models/glasses.glb' },
                { id: 'acc2', name: 'قبعة', model: 'models/hat.glb' },
                { id: 'acc3', name: 'قناع', model: 'models/mask.glb' }
            ]
        };

        this.setupUI();
    }

    setupUI() {
        const characterUI = document.createElement('div');
        characterUI.id = 'character-ui';
        characterUI.innerHTML = `
            <div class="character-menu hidden">
                <div class="character-selection">
                    <h2>اختر شخصيتك</h2>
                    <div class="character-grid">
                        ${Object.entries(this.characters).map(([id, char]) => `
                            <div class="character-card" data-character="${id}">
                                <h3>${char.name}</h3>
                                <div class="character-preview"></div>
                                <p>${char.description}</p>
                                <div class="stats">
                                    <div>القوة: ${char.stats.strength}</div>
                                    <div>السرعة: ${char.stats.speed}</div>
                                    <div>التحمل: ${char.stats.stamina}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="character-customization">
                    <h2>تخصيص الشخصية</h2>
                    <div class="customization-options">
                        <div class="option-group">
                            <h3>لون البشرة</h3>
                            <div class="color-options">
                                ${this.customizationOptions.skin.map(skin => `
                                    <div class="color-option" data-skin="${skin.id}" style="background-color: ${skin.color}">
                                        <span>${skin.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="option-group">
                            <h3>الشعر</h3>
                            <select class="hair-select">
                                ${this.customizationOptions.hair.map(hair => `
                                    <option value="${hair.id}">${hair.name}</option>
                                `).join('')}
                            </select>
                            <div class="color-options">
                                ${this.customizationOptions.hairColor.map(color => `
                                    <div class="color-option" data-hair-color="${color.id}" style="background-color: ${color.color}">
                                        <span>${color.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="option-group">
                            <h3>الملابس</h3>
                            <select class="clothes-select">
                                ${this.customizationOptions.clothes.map(outfit => `
                                    <option value="${outfit.id}">${outfit.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="option-group">
                            <h3>الإكسسوارات</h3>
                            <div class="accessories-options">
                                ${this.customizationOptions.accessories.map(acc => `
                                    <label>
                                        <input type="checkbox" value="${acc.id}">
                                        ${acc.name}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <button id="save-character">حفظ التغييرات</button>
                </div>
            </div>
            <button id="character-button">تخصيص الشخصية 👤</button>
        `;
        document.body.appendChild(characterUI);

        // إضافة الأنماط
        const style = document.createElement('style');
        style.textContent = `
            #character-ui {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            .character-menu {
                background: rgba(0, 0, 0, 0.9);
                padding: 20px;
                border-radius: 10px;
                color: white;
                width: 800px;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .character-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin: 20px 0;
            }
            
            .character-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .character-card:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .character-preview {
                height: 200px;
                margin: 10px 0;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 5px;
            }
            
            .stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-top: 10px;
            }
            
            .customization-options {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 20px 0;
            }
            
            .option-group {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 8px;
            }
            
            .color-options {
                display: flex;
                gap: 10px;
                margin: 10px 0;
            }
            
            .color-option {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                position: relative;
            }
            
            .color-option span {
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
                font-size: 12px;
            }
            
            select, button {
                width: 100%;
                padding: 8px;
                margin: 5px 0;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                border-radius: 5px;
                color: white;
            }
            
            button:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .accessories-options {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .hidden {
                display: none;
            }
            
            #character-button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);

        this.bindEvents();
    }

    bindEvents() {
        const characterButton = document.getElementById('character-button');
        const characterMenu = document.querySelector('.character-menu');
        const saveButton = document.getElementById('save-character');

        characterButton.addEventListener('click', () => {
            characterMenu.classList.toggle('hidden');
        });

        // اختيار الشخصية
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', () => {
                const characterId = card.dataset.character;
                this.selectCharacter(characterId);
            });
        });

        // تخصيص الشخصية
        document.querySelectorAll('.color-option[data-skin]').forEach(option => {
            option.addEventListener('click', () => {
                this.updateSkinColor(option.dataset.skin);
            });
        });

        document.querySelector('.hair-select').addEventListener('change', (e) => {
            this.updateHair(e.target.value);
        });

        document.querySelectorAll('.color-option[data-hair-color]').forEach(option => {
            option.addEventListener('click', () => {
                this.updateHairColor(option.dataset.hairColor);
            });
        });

        document.querySelector('.clothes-select').addEventListener('change', (e) => {
            this.updateClothes(e.target.value);
        });

        document.querySelectorAll('.accessories-options input').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateAccessories();
            });
        });

        saveButton.addEventListener('click', () => {
            this.saveCharacter();
            characterMenu.classList.add('hidden');
        });
    }

    selectCharacter(characterId) {
        const character = this.characters[characterId];
        if (!character) return;

        this.currentCharacter = {
            ...character,
            customization: {
                skin: this.customizationOptions.skin[0].id,
                hair: this.customizationOptions.hair[0].id,
                hairColor: this.customizationOptions.hairColor[0].id,
                clothes: this.customizationOptions.clothes[0].id,
                accessories: []
            }
        };

        this.updateCharacterPreview();
    }

    updateSkinColor(skinId) {
        if (!this.currentCharacter) return;
        this.currentCharacter.customization.skin = skinId;
        this.updateCharacterPreview();
    }

    updateHair(hairId) {
        if (!this.currentCharacter) return;
        this.currentCharacter.customization.hair = hairId;
        this.updateCharacterPreview();
    }

    updateHairColor(colorId) {
        if (!this.currentCharacter) return;
        this.currentCharacter.customization.hairColor = colorId;
        this.updateCharacterPreview();
    }

    updateClothes(clothesId) {
        if (!this.currentCharacter) return;
        this.currentCharacter.customization.clothes = clothesId;
        this.updateCharacterPreview();
    }

    updateAccessories() {
        if (!this.currentCharacter) return;
        const accessories = [];
        document.querySelectorAll('.accessories-options input:checked').forEach(checkbox => {
            accessories.push(checkbox.value);
        });
        this.currentCharacter.customization.accessories = accessories;
        this.updateCharacterPreview();
    }

    updateCharacterPreview() {
        // تحديث نموذج الشخصية ثلاثي الأبعاد
        if (window.game) {
            game.updatePlayerModel(this.currentCharacter);
        }
    }

    saveCharacter() {
        if (!this.currentCharacter) return;
        
        // حفظ الشخصية في التخزين المحلي
        localStorage.setItem('savedCharacter', JSON.stringify(this.currentCharacter));
        
        // تحديث الشخصية في اللعبة
        if (window.game) {
            game.updatePlayerModel(this.currentCharacter);
        }

        // إرسال التحديث في اللعب الجماعي
        if (window.multiplayerManager) {
            window.multiplayerManager.broadcastCharacterUpdate(this.currentCharacter);
        }
    }

    loadSavedCharacter() {
        const saved = localStorage.getItem('savedCharacter');
        if (saved) {
            this.currentCharacter = JSON.parse(saved);
            this.updateCharacterPreview();
        }
    }
}
