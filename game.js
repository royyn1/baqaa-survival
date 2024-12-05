// استيراد المكتبات والوحدات
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/jsm/controls/OrbitControls.js';
import { AISystem } from './ai/ai_system.js';
import { OnlineLearning } from './ai/ai_online_learning.js';

class Game {
    constructor() {
        try {
            // إعداد متغيرات اللعبة
            this.lastUpdate = Date.now();
            this.timeOfDay = 12; // تبدأ في منتصف النهار
            this.gameSpeed = 1;
            
            // إعداد نظام الرسوميات
            this.initializeGraphics();
            
            // إعداد أنظمة الذكاء الاصطناعي
            this.initializeAI();
            
            // إعداد حالة اللاعب
            this.initializePlayer();
            
            // بدء حلقة التحديث
            this.animate();
            
            console.log('تم تهيئة اللعبة بنجاح');
        } catch (error) {
            console.error('خطأ في تهيئة اللعبة:', error);
            this.showErrorMessage('حدث خطأ أثناء تحميل اللعبة. يرجى تحديث الصفحة.');
        }
    }

    initializeGraphics() {
        try {
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('لم يتم العثور على عنصر Canvas');
            }

            // إعداد المحرك
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.canvas.appendChild(this.renderer.domElement);

            // إعداد المشهد
            this.scene = new THREE.Scene();
            
            // إعداد الكاميرا
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.set(0, 10, 20);
            this.camera.lookAt(0, 0, 0);

            // إعداد التحكم
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;

            // إعداد الإضاءة
            this.setupLighting();

            // إضافة معالج تغيير حجم النافذة
            window.addEventListener('resize', () => this.onWindowResize(), false);

        } catch (error) {
            console.error('خطأ في تهيئة الرسوميات:', error);
            throw error;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupLighting() {
        try {
            // إضاءة محيطية
            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            this.scene.add(ambientLight);
            
            // إضاءة موجهة (الشمس)
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(50, 200, 100);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);
            
            // إعدادات الظل
            this.configureShadows(directionalLight);
        } catch (error) {
            console.error('خطأ في إعداد الإضاءة:', error);
            throw error;
        }
    }

    initializeAI() {
        try {
            this.aiSystem = new AISystem();
            this.onlineLearning = new OnlineLearning();
            
            // بدء عملية التعلم المستمر
            this.onlineLearning.startLearning();
        } catch (error) {
            console.error('خطأ في تهيئة الذكاء الاصطناعي:', error);
            throw error;
        }
    }

    initializePlayer() {
        try {
            this.player = {
                health: 100,
                hunger: 100,
                thirst: 100,
                energy: 100
            };
        } catch (error) {
            console.error('خطأ في تهيئة اللاعب:', error);
            throw error;
        }
    }

    configureShadows(light) {
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());
            
            const currentTime = Date.now();
            const deltaTime = (currentTime - this.lastUpdate) / 1000;
            this.lastUpdate = currentTime;

            // تحديث حالة اللعبة
            this.updateGameState(deltaTime);
            
            // تحديث الذكاء الاصطناعي
            this.updateAI(deltaTime);
            
            // تحديث الرسوميات
            this.renderer.render(this.scene, this.camera);
            
        } catch (error) {
            console.error('خطأ في حلقة التحديث:', error);
            this.showErrorMessage('حدث خطأ أثناء تشغيل اللعبة');
        }
    }

    updateGameState(deltaTime) {
        try {
            // تحديث حالة اللاعب
            this.updatePlayerState(deltaTime);
            
            // تحديث الوقت في اللعبة
            this.updateTimeOfDay(deltaTime);
            
            // تحديث الواجهة
            this.updateUI();
        } catch (error) {
            console.error('خطأ في تحديث حالة اللعبة:', error);
        }
    }

    updatePlayerState(deltaTime) {
        // تحديث احتياجات اللاعب
        this.player.hunger = Math.max(0, this.player.hunger - deltaTime * 2);
        this.player.thirst = Math.max(0, this.player.thirst - deltaTime * 3);
        this.player.energy = Math.max(0, this.player.energy - deltaTime);
        
        // تأثير الجوع والعطش على الصحة
        if (this.player.hunger <= 0 || this.player.thirst <= 0) {
            this.player.health = Math.max(0, this.player.health - deltaTime * 5);
        }
    }

    updateTimeOfDay(deltaTime) {
        this.timeOfDay += deltaTime * this.gameSpeed;
        if (this.timeOfDay >= 24) {
            this.timeOfDay = 0;
        }
        
        // تحديث شدة الإضاءة بناءً على وقت اليوم
        this.updateLightIntensity();
    }

    updateLightIntensity() {
        const directionalLight = this.scene.getObjectByProperty('type', 'DirectionalLight');
        if (directionalLight) {
            // حساب شدة الإضاءة بناءً على وقت اليوم
            const intensity = this.calculateDayLightIntensity(this.timeOfDay);
            directionalLight.intensity = intensity;
        }
    }

    calculateDayLightIntensity(time) {
        // حساب شدة الإضاءة بشكل تدريجي
        if (time >= 6 && time <= 18) {
            // وقت النهار
            return 1.0;
        } else if (time < 6) {
            // الفجر
            return 0.3 + (time / 6) * 0.7;
        } else {
            // الغروب
            return Math.max(0.3, 1.0 - ((time - 18) / 6) * 0.7);
        }
    }

    updateUI() {
        try {
            // تحديث مؤشرات حالة اللاعب
            const elements = {
                health: this.player.health,
                hunger: this.player.hunger,
                thirst: this.player.thirst,
                energy: this.player.energy
            };
            
            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = Math.round(value);
                }
            }
        } catch (error) {
            console.error('خطأ في تحديث الواجهة:', error);
        }
    }

    updateAI(deltaTime) {
        try {
            this.aiSystem.update(deltaTime);
            this.onlineLearning.update(deltaTime);
        } catch (error) {
            console.error('خطأ في تحديث الذكاء الاصطناعي:', error);
        }
    }

    showErrorMessage(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
}

// بدء اللعبة عند تحميل الصفحة
window.onload = () => {
    try {
        new Game();
    } catch (error) {
        console.error('خطأ في بدء اللعبة:', error);
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = 'حدث خطأ أثناء بدء اللعبة. يرجى تحديث الصفحة.';
            errorElement.style.display = 'block';
        }
    }
};

// تصدير الفئة
export default Game;
