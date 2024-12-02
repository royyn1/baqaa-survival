/*
 * لعبة البقاء على قيد الحياة
 * حقوق النشر 2024 جميع الحقوق محفوظة
 * يمنع النسخ أو التعديل أو إعادة النشر
 */

// منع استخدام أدوات المطور
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
    }
});

// منع النسخ
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('cut', e => e.preventDefault());

let camera, scene, renderer, player, raft;
let resources = [];
let enemies = [];
const inventory = { wood: 0, metal: 0, food: 0 };

// إعداد المشهد
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // إضافة الإضاءة
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // إنشاء البحر
    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
    const waterMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x0077be,
        transparent: true,
        opacity: 0.6
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5;
    scene.add(water);

    // إنشاء الطوف
    createRaft();

    // إضافة الموارد
    createResources();

    // إضافة الأعداء
    createEnemies();

    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // إضافة التحكم باللمس للأجهزة المحمولة
    setupMobileControls();
}

function createRaft() {
    const raftGeometry = new THREE.BoxGeometry(5, 0.5, 5);
    const raftMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    raft = new THREE.Mesh(raftGeometry, raftMaterial);
    scene.add(raft);
}

function createResources() {
    for (let i = 0; i < 20; i++) {
        const resourceGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const resourceMaterial = new THREE.MeshPhongMaterial({ 
            color: Math.random() > 0.5 ? 0x8b4513 : 0x808080 
        });
        const resource = new THREE.Mesh(resourceGeometry, resourceMaterial);
        resource.position.set(
            Math.random() * 40 - 20,
            0,
            Math.random() * 40 - 20
        );
        resource.type = Math.random() > 0.5 ? 'wood' : 'metal';
        resources.push(resource);
        scene.add(resource);
    }
}

function createEnemies() {
    for (let i = 0; i < 5; i++) {
        const enemyGeometry = new THREE.ConeGeometry(0.5, 1, 32);
        const enemyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        enemy.position.set(
            Math.random() * 40 - 20,
            0.5,
            Math.random() * 40 - 20
        );
        enemy.health = 100;
        enemies.push(enemy);
        scene.add(enemy);
    }
}

function setupMobileControls() {
    const controls = {
        up: document.getElementById('up'),
        down: document.getElementById('down'),
        left: document.getElementById('left'),
        right: document.getElementById('right'),
        action: document.getElementById('action')
    };

    // التحكم باللمس
    Object.keys(controls).forEach(key => {
        const button = controls[key];
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleMobileControl(key, true);
        });
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleMobileControl(key, false);
        });
    });
}

function handleMobileControl(direction, isPressed) {
    switch(direction) {
        case 'up':
            movePlayer(0, 0, -0.1);
            break;
        case 'down':
            movePlayer(0, 0, 0.1);
            break;
        case 'left':
            movePlayer(-0.1, 0, 0);
            break;
        case 'right':
            movePlayer(0.1, 0, 0);
            break;
        case 'action':
            collectResources();
            break;
    }
}

function movePlayer(x, y, z) {
    camera.position.x += x;
    camera.position.y += y;
    camera.position.z += z;
    raft.position.x = camera.position.x;
    raft.position.z = camera.position.z;
}

function collectResources() {
    resources.forEach(resource => {
        const distance = resource.position.distanceTo(camera.position);
        if (distance < 2) {
            inventory[resource.type]++;
            updateInventoryDisplay();
            respawnResource(resource);
        }
    });
}

function respawnResource(resource) {
    resource.position.set(
        Math.random() * 40 - 20,
        0,
        Math.random() * 40 - 20
    );
}

function updateInventoryDisplay() {
    document.getElementById('wood').textContent = inventory.wood;
    document.getElementById('metal').textContent = inventory.metal;
    document.getElementById('food').textContent = inventory.food;
}

function animate() {
    requestAnimationFrame(animate);

    // تحريك الأعداء
    enemies.forEach(enemy => {
        enemy.position.x += Math.sin(Date.now() * 0.001) * 0.02;
        enemy.position.z += Math.cos(Date.now() * 0.001) * 0.02;
    });

    // تحريك الموارد
    resources.forEach(resource => {
        resource.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

// التحكم بلوحة المفاتيح
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function handleKeyboardControls() {
    if (keys['w'] || keys['ArrowUp']) movePlayer(0, 0, -0.1);
    if (keys['s'] || keys['ArrowDown']) movePlayer(0, 0, 0.1);
    if (keys['a'] || keys['ArrowLeft']) movePlayer(-0.1, 0, 0);
    if (keys['d'] || keys['ArrowRight']) movePlayer(0.1, 0, 0);
    if (keys['e']) expandRaft();
    if (keys['t']) toggleChat();
}

function expandRaft() {
    if (inventory.wood >= 5) {
        inventory.wood -= 5;
        raft.scale.x += 0.5;
        raft.scale.z += 0.5;
        updateInventoryDisplay();
    }
}

function toggleChat() {
    const chat = document.getElementById('chat');
    chat.style.display = chat.style.display === 'none' ? 'block' : 'none';
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value;
    if (message) {
        // هنا يمكن إضافة منطق معالجة الرسائل
        console.log('رسالة:', message);
        input.value = '';
    }
}

// تحديث حجم الشاشة
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// بدء اللعبة
init();
animate();

// تحديث مستمر للتحكم
setInterval(handleKeyboardControls, 16);
