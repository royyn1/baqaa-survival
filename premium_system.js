class PremiumSystem {
    constructor() {
        this.premiumItems = {
            // الأسلحة المميزة
            weapons: {
                legendaryBow: {
                    id: 'bow_001',
                    name: 'القوس الأسطوري',
                    price: 9.99,
                    features: {
                        damage: 150,
                        range: 200,
                        special: 'سهام متعددة'
                    },
                    preview: 'assets/weapons/legendary_bow.glb'
                },
                plasmaSword: {
                    id: 'sword_001',
                    name: 'سيف البلازما',
                    price: 14.99,
                    features: {
                        damage: 200,
                        speed: 180,
                        special: 'ضربة صاعقة'
                    },
                    preview: 'assets/weapons/plasma_sword.glb'
                }
            },

            // الدروع المميزة
            armor: {
                dragonScale: {
                    id: 'armor_001',
                    name: 'درع التنين',
                    price: 19.99,
                    features: {
                        defense: 180,
                        mobility: 150,
                        special: 'مقاومة النار'
                    },
                    preview: 'assets/armor/dragon_scale.glb'
                },
                shadowCloak: {
                    id: 'armor_002',
                    name: 'عباءة الظل',
                    price: 24.99,
                    features: {
                        defense: 130,
                        stealth: 200,
                        special: 'التخفي'
                    },
                    preview: 'assets/armor/shadow_cloak.glb'
                }
            },

            // المركبات المميزة
            vehicles: {
                skyRider: {
                    id: 'vehicle_001',
                    name: 'مركبة السماء',
                    price: 29.99,
                    features: {
                        speed: 250,
                        capacity: 4,
                        special: 'الطيران'
                    },
                    preview: 'assets/vehicles/sky_rider.glb'
                },
                seaCruiser: {
                    id: 'vehicle_002',
                    name: 'سفينة الأعماق',
                    price: 34.99,
                    features: {
                        speed: 200,
                        capacity: 6,
                        special: 'الغوص'
                    },
                    preview: 'assets/vehicles/sea_cruiser.glb'
                }
            },

            // الحيوانات الأليفة المميزة
            pets: {
                babyDragon: {
                    id: 'pet_001',
                    name: 'تنين صغير',
                    price: 39.99,
                    features: {
                        attack: 150,
                        loyalty: 200,
                        special: 'حماية من النار'
                    },
                    preview: 'assets/pets/baby_dragon.glb'
                },
                shadowWolf: {
                    id: 'pet_002',
                    name: 'ذئب الظل',
                    price: 29.99,
                    features: {
                        attack: 130,
                        speed: 180,
                        special: 'رؤية ليلية'
                    },
                    preview: 'assets/pets/shadow_wolf.glb'
                }
            },

            // حزم خاصة
            bundles: {
                warriorPack: {
                    id: 'bundle_001',
                    name: 'حزمة المحارب',
                    price: 49.99,
                    items: ['sword_001', 'armor_001'],
                    discount: '20%',
                    preview: 'assets/bundles/warrior_pack.png'
                },
                explorerPack: {
                    id: 'bundle_002',
                    name: 'حزمة المستكشف',
                    price: 59.99,
                    items: ['vehicle_001', 'pet_002'],
                    discount: '25%',
                    preview: 'assets/bundles/explorer_pack.png'
                }
            }
        };

        this.paymentSystem = new PaymentSystem();
        this.setupUI();
    }

    setupUI() {
        const shopUI = document.createElement('div');
        shopUI.id = 'premium-shop';
        shopUI.innerHTML = `
            <div class="shop-container">
                <div class="shop-header">
                    <h2>المتجر المميز</h2>
                    <div class="currency-display">
                        <span class="gems">💎 0</span>
                        <span class="coins">🪙 0</span>
                    </div>
                </div>
                
                <div class="shop-categories">
                    <button class="category-btn active" data-category="weapons">أسلحة</button>
                    <button class="category-btn" data-category="armor">دروع</button>
                    <button class="category-btn" data-category="vehicles">مركبات</button>
                    <button class="category-btn" data-category="pets">حيوانات أليفة</button>
                    <button class="category-btn" data-category="bundles">حزم خاصة</button>
                </div>
                
                <div class="items-grid">
                    ${this.generateItemsHTML()}
                </div>
            </div>
        `;

        // إضافة الأنماط
        const style = document.createElement('style');
        style.textContent = `
            #premium-shop {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                padding: 20px;
                border-radius: 15px;
                color: white;
                display: none;
                z-index: 1000;
            }

            .shop-container {
                width: 800px;
                max-height: 80vh;
                overflow-y: auto;
            }

            .shop-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .currency-display {
                font-size: 1.2em;
            }

            .shop-categories {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }

            .category-btn {
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 20px;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
            }

            .category-btn.active {
                background: #4CAF50;
            }

            .items-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }

            .item-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                transition: all 0.3s;
            }

            .item-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }

            .item-preview {
                height: 200px;
                margin: 10px 0;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 5px;
            }

            .item-features {
                margin: 10px 0;
                text-align: left;
            }

            .buy-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .buy-btn:hover {
                background: #45a049;
            }
        `;
        document.head.appendChild(style);

        this.bindEvents();
    }

    generateItemsHTML() {
        let html = '';
        for (const category in this.premiumItems) {
            for (const item of Object.values(this.premiumItems[category])) {
                html += `
                    <div class="item-card" data-item-id="${item.id}">
                        <h3>${item.name}</h3>
                        <div class="item-preview">
                            <img src="${item.preview}" alt="${item.name}">
                        </div>
                        <div class="item-features">
                            ${this.generateFeaturesHTML(item.features)}
                        </div>
                        <div class="item-price">
                            ${item.discount ? `
                                <span class="original-price">$${item.price}</span>
                                <span class="discount-price">$${this.calculateDiscountPrice(item.price, item.discount)}</span>
                            ` : `
                                <span class="price">$${item.price}</span>
                            `}
                        </div>
                        <button class="buy-btn" data-item-id="${item.id}">شراء</button>
                    </div>
                `;
            }
        }
        return html;
    }

    generateFeaturesHTML(features) {
        let html = '';
        for (const [key, value] of Object.entries(features)) {
            html += `<div class="feature"><span>${key}:</span> ${value}</div>`;
        }
        return html;
    }

    calculateDiscountPrice(price, discount) {
        const discountPercent = parseInt(discount);
        return (price * (100 - discountPercent) / 100).toFixed(2);
    }

    bindEvents() {
        // تبديل الفئات
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchCategory(btn.dataset.category);
            });
        });

        // شراء العناصر
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.initiatePurchase(btn.dataset.itemId);
            });
        });
    }

    async initiatePayment(itemId) {
        try {
            const item = this.findItem(itemId);
            if (!item) throw new Error('العنصر غير موجود');

            const paymentResult = await this.paymentSystem.processPayment({
                amount: item.price,
                currency: 'USD',
                itemId: item.id,
                itemName: item.name
            });

            if (paymentResult.success) {
                this.grantItem(itemId);
                this.showSuccess(`تم شراء ${item.name} بنجاح!`);
            }
        } catch (error) {
            this.showError('فشل في عملية الشراء: ' + error.message);
        }
    }

    findItem(itemId) {
        for (const category of Object.values(this.premiumItems)) {
            for (const item of Object.values(category)) {
                if (item.id === itemId) return item;
            }
        }
        return null;
    }

    grantItem(itemId) {
        const item = this.findItem(itemId);
        if (!item) return;

        // إضافة العنصر إلى مخزون اللاعب
        if (window.playerInventory) {
            window.playerInventory.addItem(item);
        }

        // حفظ في قاعدة البيانات
        this.saveToDatabase(itemId);
    }

    saveToDatabase(itemId) {
        // حفظ المشتريات في قاعدة البيانات
        const purchase = {
            itemId: itemId,
            userId: window.currentUser?.id,
            timestamp: Date.now(),
            price: this.findItem(itemId).price
        };

        // إرسال إلى الخادم
        fetch('/api/purchases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchase)
        });
    }

    showSuccess(message) {
        // عرض رسالة نجاح
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showError(message) {
        // عرض رسالة خطأ
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// نظام الدفع
class PaymentSystem {
    async processPayment(paymentDetails) {
        // التكامل مع بوابة الدفع
        try {
            const response = await fetch('/api/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentDetails)
            });

            if (!response.ok) throw new Error('فشل في عملية الدفع');

            return await response.json();
        } catch (error) {
            throw new Error('خطأ في معالجة الدفع: ' + error.message);
        }
    }
}
