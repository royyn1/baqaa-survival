import AdvancedGraphics from './public/js/advanced_graphics.js';

class Game {
    constructor() {
        // إعداد نظام الرسوميات
        this.canvas = document.getElementById('gameCanvas');
        this.graphics = new AdvancedGraphics(this.canvas);
        
        // إعداد الكاميرا
        const camera = this.graphics.getCamera();
        camera.position.z = 5;
        
        // بدء حلقة التحديث
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.graphics.render();
    }
}

// بدء اللعبة
window.onload = () => {
    new Game();
};
