/**
 * نظام الرسوميات المتقدم للعبة
 */
class AdvancedGraphics {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2');
        if (!this.gl) {
            console.error('WebGL2 غير مدعوم في هذا المتصفح');
            return;
        }

        // إعداد النظام
        this.setupGL();
        this.loadShaders();
        this.setupCamera();
        this.setupLighting();
        this.loadTextures();
        this.setupPostProcessing();
    }

    setupGL() {
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    async loadShaders() {
        // شيدر القمة الأساسي
        const vsSource = `#version 300 es
            precision highp float;
            
            in vec3 aPosition;
            in vec3 aNormal;
            in vec2 aTexCoord;
            
            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            out vec3 vNormal;
            out vec2 vTexCoord;
            out vec3 vPosition;
            
            void main() {
                vNormal = mat3(uModelMatrix) * aNormal;
                vTexCoord = aTexCoord;
                vPosition = vec3(uModelMatrix * vec4(aPosition, 1.0));
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            }
        `;

        // شيدر الشظايا الأساسي
        const fsSource = `#version 300 es
            precision highp float;
            
            in vec3 vNormal;
            in vec2 vTexCoord;
            in vec3 vPosition;
            
            uniform sampler2D uTexture;
            uniform vec3 uLightPosition;
            uniform vec3 uViewPosition;
            
            out vec4 fragColor;
            
            void main() {
                // الإضاءة المحيطة
                vec3 ambient = vec3(0.1);
                
                // الإضاءة المنتشرة
                vec3 norm = normalize(vNormal);
                vec3 lightDir = normalize(uLightPosition - vPosition);
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 diffuse = diff * vec3(1.0);
                
                // الإضاءة اللامعة
                vec3 viewDir = normalize(uViewPosition - vPosition);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                vec3 specular = spec * vec3(0.5);
                
                // النتيجة النهائية
                vec4 texColor = texture(uTexture, vTexCoord);
                vec3 result = (ambient + diffuse + specular) * texColor.rgb;
                fragColor = vec4(result, texColor.a);
            }
        `;

        // إنشاء برنامج الشيدر
        this.mainProgram = this.createShaderProgram(vsSource, fsSource);
    }

    createShaderProgram(vsSource, fsSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('خطأ في ربط الشيدر:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('خطأ في ترجمة الشيدر:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    setupCamera() {
        this.camera = {
            position: [0, 5, 10],
            target: [0, 0, 0],
            up: [0, 1, 0],
            fov: 45,
            aspect: this.canvas.width / this.canvas.height,
            near: 0.1,
            far: 100.0
        };

        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    updateViewMatrix() {
        this.viewMatrix = mat4.create();
        mat4.lookAt(
            this.viewMatrix,
            this.camera.position,
            this.camera.target,
            this.camera.up
        );
    }

    updateProjectionMatrix() {
        this.projectionMatrix = mat4.create();
        mat4.perspective(
            this.projectionMatrix,
            this.camera.fov * Math.PI / 180,
            this.camera.aspect,
            this.camera.near,
            this.camera.far
        );
    }

    setupLighting() {
        this.lighting = {
            position: [5, 5, 5],
            ambient: [0.1, 0.1, 0.1],
            diffuse: [1.0, 1.0, 1.0],
            specular: [1.0, 1.0, 1.0]
        };
    }

    async loadTextures() {
        this.textures = {};
        const textureNames = ['water', 'sand', 'grass', 'rock', 'wood'];
        
        for (const name of textureNames) {
            try {
                const texture = await this.loadTexture(`assets/textures/${name}.png`);
                this.textures[name] = texture;
            } catch (error) {
                console.error(`خطأ في تحميل القوام ${name}:`, error);
            }
        }
    }

    async loadTexture(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const texture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.texImage2D(
                    this.gl.TEXTURE_2D,
                    0,
                    this.gl.RGBA,
                    this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE,
                    image
                );
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                resolve(texture);
            };
            image.onerror = reject;
            image.src = url;
        });
    }

    setupPostProcessing() {
        // إعداد framebuffer للتأثيرات
        this.postProcess = {
            framebuffer: this.gl.createFramebuffer(),
            texture: this.gl.createTexture(),
            depthBuffer: this.gl.createRenderbuffer()
        };

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.postProcess.texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.canvas.width,
            this.canvas.height,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            null
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.postProcess.depthBuffer);
        this.gl.renderbufferStorage(
            this.gl.RENDERBUFFER,
            this.gl.DEPTH_COMPONENT16,
            this.canvas.width,
            this.canvas.height
        );

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.postProcess.framebuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            this.postProcess.texture,
            0
        );
        this.gl.framebufferRenderbuffer(
            this.gl.FRAMEBUFFER,
            this.gl.DEPTH_ATTACHMENT,
            this.gl.RENDERBUFFER,
            this.postProcess.depthBuffer
        );
    }

    render(scene) {
        // رسم المشهد إلى framebuffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.postProcess.framebuffer);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // رسم كل الكائنات
        for (const object of scene.objects) {
            this.renderObject(object);
        }

        // تطبيق التأثيرات
        this.applyPostProcessing();

        // عرض النتيجة النهائية
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.renderToScreen();
    }

    renderObject(object) {
        // استخدام برنامج الشيدر
        this.gl.useProgram(this.mainProgram);

        // تعيين المصفوفات
        this.gl.uniformMatrix4fv(
            this.gl.getUniformLocation(this.mainProgram, 'uModelMatrix'),
            false,
            object.modelMatrix
        );
        this.gl.uniformMatrix4fv(
            this.gl.getUniformLocation(this.mainProgram, 'uViewMatrix'),
            false,
            this.viewMatrix
        );
        this.gl.uniformMatrix4fv(
            this.gl.getUniformLocation(this.mainProgram, 'uProjectionMatrix'),
            false,
            this.projectionMatrix
        );

        // تعيين القوام
        if (object.texture) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, object.texture);
            this.gl.uniform1i(
                this.gl.getUniformLocation(this.mainProgram, 'uTexture'),
                0
            );
        }

        // رسم الكائن
        this.gl.bindVertexArray(object.vao);
        this.gl.drawElements(
            this.gl.TRIANGLES,
            object.indices.length,
            this.gl.UNSIGNED_SHORT,
            0
        );
    }

    applyPostProcessing() {
        // تطبيق تأثيرات ما بعد المعالجة
        // مثل تأثير التوهج وتصحيح الألوان
    }

    renderToScreen() {
        // عرض النتيجة النهائية على الشاشة
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // استخدام برنامج الشيدر النهائي
        // ورسم مستطيل بحجم الشاشة
    }

    cleanup() {
        // تنظيف الموارد
        for (const texture of Object.values(this.textures)) {
            this.gl.deleteTexture(texture);
        }
        this.gl.deleteProgram(this.mainProgram);
        this.gl.deleteFramebuffer(this.postProcess.framebuffer);
        this.gl.deleteTexture(this.postProcess.texture);
        this.gl.deleteRenderbuffer(this.postProcess.depthBuffer);
    }
}

// تصدير الفئة
export default AdvancedGraphics;
