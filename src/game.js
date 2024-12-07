import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';
import { GameLogger } from './logger.js';

// إنشاء مسجل الأخطاء
const logger = new GameLogger();

try {
    // تهيئة المشهد
    logger.logInfo('بدء تهيئة المشهد');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // تهيئة الكاميرا
    logger.logInfo('تهيئة الكاميرا');
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // تهيئة المحرك
    logger.logInfo('تهيئة محرك العرض');
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#gameCanvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // إضافة الإضاءة
    logger.logInfo('إضافة الإضاءة');
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // إضافة مكعب
    logger.logInfo('إضافة المكعب');
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshPhongMaterial({ color: 0xff0000 })
    );
    cube.position.y = 0.5;
    scene.add(cube);

    // إضافة الأرض
    logger.logInfo('إضافة الأرض');
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshPhongMaterial({ color: 0x228B22 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // معالج تغيير حجم النافذة
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        logger.logInfo('تم تحديث حجم النافذة');
    });

    // حلقة الرسم
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    logger.logInfo('بدء حلقة الرسم');
    animate();

} catch (error) {
    logger.logError({
        message: 'خطأ في تهيئة اللعبة',
        error: error
    });
}

// إضافة زر لتحميل السجلات
const downloadButton = document.createElement('button');
downloadButton.textContent = 'تحميل سجلات الأخطاء';
downloadButton.style.position = 'fixed';
downloadButton.style.bottom = '10px';
downloadButton.style.right = '10px';
downloadButton.style.padding = '10px';
downloadButton.style.backgroundColor = '#333';
downloadButton.style.color = 'white';
downloadButton.style.border = 'none';
downloadButton.style.borderRadius = '5px';
downloadButton.style.cursor = 'pointer';
downloadButton.onclick = () => logger.downloadLogs();
document.body.appendChild(downloadButton);
