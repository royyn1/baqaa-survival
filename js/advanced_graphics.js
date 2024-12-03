/**
 * نظام الرسوميات المتقدم للعبة باستخدام Three.js
 */
export default class AdvancedGraphics {
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Canvas element is required');
        }

        this.canvas = canvas;
        this.initializeRenderer();
        this.initializeScene();
        this.initializeCamera();
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();
        
        // بدء حلقة الرسم
        this.animate();
    }

    initializeRenderer() {
        try {
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: this.canvas,
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            
            // تصحيح مشكلة الألوان
            this.renderer.gammaFactor = 2.2;
            this.renderer.gammaOutput = true;
            
            // تفعيل التحسينات
            this.renderer.physicallyCorrectLights = true;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1;
        } catch (error) {
            console.error('Error initializing renderer:', error);
            throw error;
        }
    }

    initializeScene() {
        try {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x87ceeb); // لون السماء
            
            // إضافة الضباب للمشهد
            this.scene.fog = new THREE.Fog(0x87ceeb, 1, 100);
            
            // إضافة الأرض
            this.addGround();
        } catch (error) {
            console.error('Error initializing scene:', error);
            throw error;
        }
    }

    initializeCamera() {
        try {
            const aspect = window.innerWidth / window.innerHeight;
            this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);
        } catch (error) {
            console.error('Error initializing camera:', error);
            throw error;
        }
    }

    setupLighting() {
        try {
            // إضاءة محيطة
            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            this.scene.add(ambientLight);

            // إضاءة موجهة (الشمس)
            this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            this.directionalLight.position.set(5, 5, 5);
            this.directionalLight.castShadow = true;
            
            // تحسين جودة الظلال
            this.directionalLight.shadow.mapSize.width = 2048;
            this.directionalLight.shadow.mapSize.height = 2048;
            this.directionalLight.shadow.camera.near = 0.5;
            this.directionalLight.shadow.camera.far = 50;
            this.directionalLight.shadow.bias = -0.0001;
            
            this.scene.add(this.directionalLight);

            // إضاءة نقطية
            const pointLight = new THREE.PointLight(0xffffff, 0.5);
            pointLight.position.set(0, 5, 0);
            this.scene.add(pointLight);
        } catch (error) {
            console.error('Error setting up lighting:', error);
            throw error;
        }
    }

    setupControls() {
        try {
            if (typeof THREE.OrbitControls === 'undefined') {
                console.error('OrbitControls is not loaded');
                return;
            }
            
            this.controls = new THREE.OrbitControls(this.camera, this.canvas);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 1;
            this.controls.maxDistance = 50;
            this.controls.maxPolarAngle = Math.PI / 2;
        } catch (error) {
            console.error('Error setting up controls:', error);
            throw error;
        }
    }

    setupEventListeners() {
        try {
            window.addEventListener('resize', () => this.onWindowResize(), false);
            
            // إضافة مستمع للتأكد من تحميل الصفحة
            window.addEventListener('load', () => {
                this.onWindowResize();
                this.render();
            });
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw error;
        }
    }

    addGround() {
        try {
            const groundGeometry = new THREE.PlaneGeometry(100, 100);
            const groundMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x556B2F,
                roughness: 0.8,
                metalness: 0.2
            });
            
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -0.5;
            ground.receiveShadow = true;
            
            this.scene.add(ground);
        } catch (error) {
            console.error('Error adding ground:', error);
            throw error;
        }
    }

    onWindowResize() {
        try {
            if (!this.camera || !this.renderer) return;
            
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            
            this.renderer.setSize(width, height);
            this.render();
        } catch (error) {
            console.error('Error handling window resize:', error);
        }
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());
            
            if (this.controls) {
                this.controls.update();
            }
            
            this.render();
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }

    render() {
        try {
            if (!this.scene || !this.camera || !this.renderer) {
                throw new Error('Required components not initialized');
            }
            
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Error rendering scene:', error);
            throw error;
        }
    }

    // واجهة برمجة لإضافة عناصر للمشهد
    add(object) {
        if (!this.scene) return;
        this.scene.add(object);
    }

    remove(object) {
        if (!this.scene) return;
        this.scene.remove(object);
    }

    getCamera() {
        return this.camera;
    }

    getScene() {
        return this.scene;
    }

    getRenderer() {
        return this.renderer;
    }
}
