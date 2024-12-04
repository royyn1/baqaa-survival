// التأكد من تحميل THREE
if (typeof THREE === 'undefined') {
    console.error('THREE is not loaded');
    document.getElementById('loading').textContent = 'خطأ: لم يتم تحميل THREE.js';
    throw new Error('THREE is not loaded');
}

class Game {
    constructor() {
        try {
            // التحقق من وجود THREE
            if (typeof THREE === 'undefined') {
                throw new Error('لم يتم تحميل مكتبة Three.js');
            }
            
            this.debug = document.getElementById('debug');
            this.updateDebug('جاري تهيئة المشهد...');
            
            // تهيئة المكونات الأساسية
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true
            });
            
            // التحقق من دعم WebGL
            if (!this.renderer.capabilities.isWebGL2) {
                throw new Error('متصفحك لا يدعم WebGL 2');
            }
            
            this.controls = null;
            
            this.init();
            this.createWorld();
            this.animate();
            
            this.updateDebug('تم تحميل اللعبة بنجاح!');
            document.getElementById('controls').style.display = 'block';
        } catch (error) {
            console.error('خطأ في إنشاء اللعبة:', error);
            this.updateDebug('حدث خطأ في تحميل اللعبة: ' + error.message);
            throw error;
        }
    }

    updateDebug(message) {
        const debug = document.getElementById('debug');
        if (debug) {
            debug.textContent = message;
            console.log(message);
        }
    }

    init() {
        try {
            // إعداد العارض
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(this.renderer.domElement);

            // إعداد الكاميرا
            this.camera.position.set(20, 20, 20);
            this.camera.lookAt(0, 0, 0);

            // إعداد التحكم في الكاميرا
            if (typeof window.OrbitControls === 'undefined') {
                throw new Error('لم يتم تحميل وحدة التحكم في الكاميرا');
            }
            
            this.controls = new window.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 50;
            this.controls.maxPolarAngle = Math.PI / 2.1;

            // إضافة الإضاءة
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 5, 5);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 50;
            directionalLight.shadow.camera.left = -25;
            directionalLight.shadow.camera.right = 25;
            directionalLight.shadow.camera.top = 25;
            directionalLight.shadow.camera.bottom = -25;
            this.scene.add(directionalLight);

            // معالجة تغيير حجم النافذة
            window.addEventListener('resize', () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });

            // إضافة الضباب للمشهد
            this.scene.fog = new THREE.FogExp2(0x88ccee, 0.02);
            this.renderer.setClearColor(this.scene.fog.color);

            this.updateDebug('تم تهيئة المشهد');
        } catch (error) {
            console.error('خطأ في تهيئة المشهد:', error);
            this.updateDebug('حدث خطأ في تهيئة المشهد: ' + error.message);
            throw error;
        }
    }

    createWorld() {
        try {
            // إنشاء الأرض
            const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
            const groundMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x558822,
                roughness: 0.8,
                metalness: 0.2
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;

            // إضافة تموجات للأرض
            const vertices = ground.geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                const z = vertices[i + 2];
                vertices[i + 1] = Math.sin(x * 0.1) * Math.sin(z * 0.1) * 2;
            }
            ground.geometry.computeVertexNormals();
            
            this.scene.add(ground);

            // إضافة الأشجار
            this.addTrees();

            this.updateDebug('تم إنشاء العالم');
        } catch (error) {
            console.error('خطأ في إنشاء العالم:', error);
            this.updateDebug('حدث خطأ في إنشاء العالم: ' + error.message);
            throw error;
        }
    }

    addTrees() {
        try {
            const treeCount = 50;
            for (let i = 0; i < treeCount; i++) {
                const tree = this.createTree();
                const angle = Math.random() * Math.PI * 2;
                const radius = 5 + Math.random() * 40;
                tree.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
                tree.rotation.y = Math.random() * Math.PI * 2;
                tree.scale.set(
                    0.8 + Math.random() * 0.4,
                    0.8 + Math.random() * 0.4,
                    0.8 + Math.random() * 0.4
                );
                this.scene.add(tree);
            }
        } catch (error) {
            console.error('خطأ في إضافة الأشجار:', error);
            this.updateDebug('حدث خطأ في إضافة الأشجار: ' + error.message);
            throw error;
        }
    }

    createTree() {
        const tree = new THREE.Group();

        // جذع الشجرة
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x663300,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        trunk.position.y = 1;
        tree.add(trunk);

        // أوراق الشجرة
        const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228822,
            roughness: 1,
            metalness: 0
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        leaves.position.y = 3;
        tree.add(leaves);

        return tree;
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());
            
            if (this.controls) {
                this.controls.update();
            }
            
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('خطأ في حلقة الرسم:', error);
            this.updateDebug('حدث خطأ في حلقة الرسم: ' + error.message);
        }
    }
}

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    try {
        window.game = new Game();
    } catch (error) {
        console.error('فشل في بدء اللعبة:', error);
        const debug = document.getElementById('debug');
        if (debug) {
            debug.textContent = 'فشل في بدء اللعبة: ' + error.message;
        }
    }
});
