// BAQAA Game - Enhanced Graphics System
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { Sky } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/objects/Sky.js';
import { Water } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/objects/Water.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

class GraphicsEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.loader = new GLTFLoader();
        
        this.init();
        this.setupLighting();
        this.createSky();
        this.createTerrain();
        this.createWater();
        this.createVegetation();
        this.setupControls();
    }

    init() {
        // إعداد المشهد الأساسي
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // إعداد الكاميرا
        this.camera.position.set(0, 2, 5);
        
        // استجابة لتغيير حجم النافذة
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLighting() {
        // إضاءة الشمس
        const sunLight = new THREE.DirectionalLight(0xffffbb, 1);
        sunLight.position.set(0, 50, 0);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        // إضاءة محيطة
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
    }

    createSky() {
        // إنشاء السماء
        const sky = new Sky();
        sky.scale.setScalar(450000);
        this.scene.add(sky);

        // إعدادات الشمس
        const sun = new THREE.Vector3();
        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = 10;
        uniforms['rayleigh'].value = 2;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.8;

        // موقع الشمس
        const phi = THREE.MathUtils.degToRad(90 - 2);
        const theta = THREE.MathUtils.degToRad(180);
        sun.setFromSphericalCoords(1, phi, theta);
        uniforms['sunPosition'].value.copy(sun);
    }

    createTerrain() {
        // إنشاء التضاريس
        const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3b7d4f,
            roughness: 0.8,
            metalness: 0.2
        });

        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        this.scene.add(terrain);

        // إضافة الجبال والتلال
        this.addMountains();
    }

    addMountains() {
        const mountainGeometry = new THREE.ConeGeometry(20, 50, 4);
        const mountainMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 1
        });

        for(let i = 0; i < 10; i++) {
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            mountain.position.set(
                Math.random() * 200 - 100,
                0,
                Math.random() * 200 - 100
            );
            mountain.scale.set(
                Math.random() * 2 + 1,
                Math.random() * 2 + 1,
                Math.random() * 2 + 1
            );
            mountain.castShadow = true;
            this.scene.add(mountain);
        }
    }

    createWater() {
        // إنشاء الماء
        const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
        const water = new Water(waterGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7
        });
        water.rotation.x = -Math.PI / 2;
        water.position.y = -5;
        this.scene.add(water);
    }

    createVegetation() {
        // إضافة الأشجار
        const treeGeometry = new THREE.CylinderGeometry(0, 4, 10, 4);
        const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x0d5c0d });
        
        for(let i = 0; i < 100; i++) {
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);
            tree.position.set(
                Math.random() * 200 - 100,
                5,
                Math.random() * 200 - 100
            );
            tree.castShadow = true;
            this.scene.add(tree);
        }

        // إضافة العشب
        this.createGrass();
    }

    createGrass() {
        const grassGeometry = new THREE.PlaneGeometry(1, 1);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e8449,
            side: THREE.DoubleSide
        });

        for(let i = 0; i < 1000; i++) {
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            grass.position.set(
                Math.random() * 200 - 100,
                0.5,
                Math.random() * 200 - 100
            );
            grass.rotation.y = Math.random() * Math.PI;
            this.scene.add(grass);
        }
    }

    setupControls() {
        // التحكم بالكاميرا
        document.addEventListener('keydown', (e) => {
            const speed = 0.5;
            switch(e.key) {
                case 'w':
                    this.camera.position.z -= speed;
                    break;
                case 's':
                    this.camera.position.z += speed;
                    break;
                case 'a':
                    this.camera.position.x -= speed;
                    break;
                case 'd':
                    this.camera.position.x += speed;
                    break;
                case ' ':
                    // القفز
                    if(this.camera.position.y === 2) {
                        this.jump();
                    }
                    break;
            }
        });

        // التحكم بالنظر
        document.addEventListener('mousemove', (e) => {
            if(document.pointerLockElement === this.renderer.domElement) {
                this.camera.rotation.y -= e.movementX * 0.002;
                this.camera.rotation.x -= e.movementY * 0.002;
            }
        });

        // قفل مؤشر الماوس
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });
    }

    jump() {
        const jumpHeight = 4;
        const jumpDuration = 500; // بالميلي ثانية
        const startY = this.camera.position.y;
        const startTime = Date.now();

        const jumpAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / jumpDuration;

            if(progress < 1) {
                this.camera.position.y = startY + jumpHeight * Math.sin(progress * Math.PI);
                requestAnimationFrame(jumpAnimation);
            } else {
                this.camera.position.y = startY;
            }
        };

        requestAnimationFrame(jumpAnimation);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

export default GraphicsEngine;
