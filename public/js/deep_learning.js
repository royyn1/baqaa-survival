export class NeuralNetwork {
    constructor(inputSize, hiddenSizes = [64, 32], outputSize) {
        this.inputSize = inputSize;
        this.hiddenSizes = hiddenSizes;
        this.outputSize = outputSize;
        
        // إنشاء طبقات متعددة
        this.layers = [];
        this.biases = [];
        
        // إنشاء الطبقات المخفية
        let currentSize = inputSize;
        for (const hiddenSize of hiddenSizes) {
            this.layers.push(this.initializeWeights(currentSize, hiddenSize));
            this.biases.push(new Array(hiddenSize).fill(0));
            currentSize = hiddenSize;
        }
        
        // طبقة الإخراج
        this.layers.push(this.initializeWeights(currentSize, outputSize));
        this.biases.push(new Array(outputSize).fill(0));
        
        // معلمات التعلم المتقدم
        this.learningRate = 0.001;
        this.momentum = 0.9;
        this.weightDecay = 0.0001;
        this.dropoutRate = 0.2;
        this.batchNormalization = true;
        
        // تخزين القيم للتدريب
        this.layerOutputs = [];
        this.dropoutMasks = [];
        this.previousUpdates = this.layers.map(layer => 
            Array.from({ length: layer.length }, () =>
                new Array(layer[0].length).fill(0)
            )
        );
        
        console.log('Enhanced Neural Network initialized with architecture:', 
            {input: inputSize, hidden: hiddenSizes, output: outputSize});
    }

    // تهيئة الأوزان باستخدام طريقة He initialization
    initializeWeights(rows, cols) {
        const stddev = Math.sqrt(2.0 / rows);
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => 
                this.gaussianRandom(0, stddev)
            )
        );
    }

    // توزيع غاوس العشوائي
    gaussianRandom(mean = 0, stddev = 1) {
        const u1 = 1 - Math.random();
        const u2 = 1 - Math.random();
        const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
        return mean + stddev * randStdNormal;
    }

    // دالة التنشيط (LeakyReLU)
    leakyRelu(x, alpha = 0.01) {
        return x > 0 ? x : alpha * x;
    }

    // مشتقة دالة LeakyReLU
    leakyReluDerivative(x, alpha = 0.01) {
        return x > 0 ? 1 : alpha;
    }

    // تطبيع الدفعة
    batchNorm(values, training = true) {
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const epsilon = 1e-8;
        return values.map(x => (x - mean) / Math.sqrt(variance + epsilon));
    }

    // Dropout
    applyDropout(values, training = true) {
        if (!training || this.dropoutRate === 0) return values;
        const mask = values.map(() => Math.random() > this.dropoutRate ? 1 / (1 - this.dropoutRate) : 0);
        this.dropoutMasks.push(mask);
        return values.map((v, i) => v * mask[i]);
    }

    // التنبؤ مع تحسينات
    predict(input, training = false) {
        let current = Array.isArray(input) ? input : [input];
        this.layerOutputs = [current];
        
        for (let i = 0; i < this.layers.length; i++) {
            // الضرب المصفوفي
            current = this.layers[i].map((row, rowIndex) => {
                const sum = row.reduce((acc, weight, colIndex) => 
                    acc + weight * current[colIndex], 0) + this.biases[i][rowIndex];
                return sum;
            });
            
            // تطبيع الدفعة إذا كان مفعلاً
            if (this.batchNormalization) {
                current = this.batchNorm(current, training);
            }
            
            // دالة التنشيط
            if (i < this.layers.length - 1) {
                current = current.map(x => this.leakyRelu(x));
                if (training) {
                    current = this.applyDropout(current);
                }
            } else {
                // Softmax للطبقة الأخيرة
                current = this.softmax(current);
            }
            
            this.layerOutputs.push(current);
        }
        
        return current;
    }

    // التدريب المحسن
    train(input, target, epochs = 1) {
        for (let epoch = 0; epoch < epochs; epoch++) {
            const output = this.predict(input, true);
            const loss = this.calculateLoss(output, target);
            
            // حساب التدرجات وتحديث الأوزان
            this.backpropagate(target);
            
            if (epoch % 100 === 0) {
                console.log(`Epoch ${epoch}, Loss: ${loss}`);
            }
        }
    }

    // حساب الخسارة (Cross-entropy)
    calculateLoss(output, target) {
        return -target.reduce((acc, t, i) => 
            acc + t * Math.log(Math.max(output[i], 1e-15)), 0);
    }

    // الانتشار الخلفي المحسن
    backpropagate(target) {
        let gradients = target.map((t, i) => 
            this.layerOutputs[this.layerOutputs.length - 1][i] - t);
        
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layerInput = this.layerOutputs[i];
            const nextGradients = Array(layerInput.length).fill(0);
            
            // تحديث الأوزان والتحيزات
            this.layers[i].forEach((weights, j) => {
                weights.forEach((weight, k) => {
                    const gradient = gradients[j] * layerInput[k];
                    const update = 
                        this.learningRate * gradient +
                        this.momentum * this.previousUpdates[i][j][k] -
                        this.weightDecay * weight;
                    
                    this.layers[i][j][k] -= update;
                    this.previousUpdates[i][j][k] = update;
                    
                    nextGradients[k] += gradients[j] * weight;
                });
                
                this.biases[i][j] -= this.learningRate * gradients[j];
            });
            
            if (i > 0) {
                gradients = nextGradients.map(g => g * this.leakyReluDerivative(g));
                if (this.dropoutMasks[i-1]) {
                    gradients = gradients.map((g, idx) => g * this.dropoutMasks[i-1][idx]);
                }
            }
        }
        
        this.dropoutMasks = [];
    }

    // حفظ النموذج
    save() {
        return {
            layers: this.layers,
            biases: this.biases,
            architecture: {
                input: this.inputSize,
                hidden: this.hiddenSizes,
                output: this.outputSize
            },
            hyperparameters: {
                learningRate: this.learningRate,
                momentum: this.momentum,
                weightDecay: this.weightDecay,
                dropoutRate: this.dropoutRate
            }
        };
    }

    // تحميل النموذج
    load(data) {
        this.layers = data.layers;
        this.biases = data.biases;
        this.inputSize = data.architecture.input;
        this.hiddenSizes = data.architecture.hidden;
        this.outputSize = data.architecture.output;
        this.learningRate = data.hyperparameters.learningRate;
        this.momentum = data.hyperparameters.momentum;
        this.weightDecay = data.hyperparameters.weightDecay;
        this.dropoutRate = data.hyperparameters.dropoutRate;
    }
}

// نظام اتخاذ القرار المتقدم
export class DecisionSystem {
    constructor(stateSize, actionSize) {
        // إنشاء شبكات عصبية متعددة للتعلم العميق
        this.mainNetwork = new NeuralNetwork(stateSize, [128, 64, 32], actionSize);
        this.targetNetwork = new NeuralNetwork(stateSize, [128, 64, 32], actionSize);
        
        // ذاكرة التجارب المحسنة
        this.memory = [];
        this.priorityMemory = []; // ذاكرة الأولوية
        this.memorySize = 100000;  // زيادة حجم الذاكرة
        this.miniBatchSize = 64;
        
        // معاملات التعلم المتقدمة
        this.gamma = 0.99;          // معامل الخصم
        this.epsilon = 1.0;         // معدل الاستكشاف
        this.epsilonMin = 0.01;
        this.epsilonDecay = 0.9995;
        this.learningRate = 0.001;
        this.targetUpdateFreq = 1000; // تحديث الشبكة الهدف
        this.steps = 0;
        
        // معاملات التعلم ذو الأولوية
        this.priorityAlpha = 0.6;    // أهمية الأولوية
        this.priorityBeta = 0.4;     // تعويض الأولوية
        this.priorityEpsilon = 1e-6;
        
        // التعلم المتعدد المهام
        this.taskWeights = {
            survival: 1.0,
            combat: 1.0,
            resource: 1.0,
            exploration: 1.0,
            building: 1.0
        };
        
        // إحصائيات التعلم
        this.stats = {
            totalReward: 0,
            episodeRewards: [],
            averageReward: 0,
            successRate: 0,
            explorationRate: this.epsilon,
            learningProgress: []
        };
        
        console.log('Enhanced Decision System initialized');
    }

    // اختيار إجراء مع استراتيجية Thompson Sampling
    async chooseAction(state, temperature = 1.0) {
        const normalizedState = this.normalizeState(state);
        
        if (Math.random() < this.epsilon) {
            // استكشاف ذكي
            return this.intelligentExploration(normalizedState);
        } else {
            // استغلال مع Thompson Sampling
            const qValues = await this.mainNetwork.predict(normalizedState);
            const noise = qValues.map(() => this.gaussianNoise(0, temperature));
            const perturbedQValues = qValues.map((q, i) => q + noise[i]);
            
            return perturbedQValues.indexOf(Math.max(...perturbedQValues));
        }
    }

    // استكشاف ذكي
    intelligentExploration(state) {
        // حساب أهمية كل إجراء بناءً على السياق
        const actionImportance = this.calculateActionImportance(state);
        
        // اختيار إجراء بناءً على الأهمية
        return this.weightedRandomChoice(actionImportance);
    }

    // حساب أهمية الإجراءات
    calculateActionImportance(state) {
        const importance = new Array(this.mainNetwork.outputSize).fill(0);
        
        // تحليل حالة اللاعب
        const playerState = this.analyzePlayerState(state);
        
        // تعديل الأهمية بناءً على الحالة
        if (playerState.health < 0.3) {
            importance[this.getActionIndex('FLEE')] += 2.0;
            importance[this.getActionIndex('GATHER')] += 1.5;
        }
        
        if (playerState.resources < 0.2) {
            importance[this.getActionIndex('GATHER')] += 2.0;
        }
        
        if (playerState.threat > 0.7) {
            importance[this.getActionIndex('COMBAT')] += 1.5;
            importance[this.getActionIndex('FLEE')] += 1.5;
        }
        
        if (playerState.exploration < 0.4) {
            importance[this.getActionIndex('EXPLORE')] += 1.2;
        }
        
        return importance;
    }

    // تحليل حالة اللاعب
    analyzePlayerState(state) {
        return {
            health: state.health || 1.0,
            resources: state.resources || 1.0,
            threat: state.threat || 0.0,
            exploration: state.exploration || 0.0
        };
    }

    // اختيار عشوائي مرجح
    weightedRandomChoice(weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) return i;
        }
        
        return weights.length - 1;
    }

    // تخزين تجربة مع أولوية
    remember(state, action, reward, nextState, done) {
        const experience = {
            state: this.normalizeState(state),
            action,
            reward,
            nextState: this.normalizeState(nextState),
            done,
            priority: 1.0
        };
        
        // حساب الأولوية
        const priority = this.calculatePriority(experience);
        experience.priority = priority;
        
        // إضافة التجربة للذاكرة
        if (this.memory.length >= this.memorySize) {
            // إزالة التجربة الأقل أهمية
            const minPriorityIndex = this.findMinPriorityIndex();
            if (priority > this.memory[minPriorityIndex].priority) {
                this.memory[minPriorityIndex] = experience;
            }
        } else {
            this.memory.push(experience);
        }
        
        // تحديث الإحصائيات
        this.updateStats(reward);
    }

    // حساب أولوية التجربة
    calculatePriority(experience) {
        const prediction = this.mainNetwork.predict(experience.state);
        const nextPrediction = this.targetNetwork.predict(experience.nextState);
        const target = experience.reward + this.gamma * Math.max(...nextPrediction) * (1 - experience.done);
        const error = Math.abs(target - prediction[experience.action]);
        
        return Math.pow(error + this.priorityEpsilon, this.priorityAlpha);
    }

    // البحث عن أقل أولوية
    findMinPriorityIndex() {
        let minIndex = 0;
        let minPriority = this.memory[0].priority;
        
        for (let i = 1; i < this.memory.length; i++) {
            if (this.memory[i].priority < minPriority) {
                minPriority = this.memory[i].priority;
                minIndex = i;
            }
        }
        
        return minIndex;
    }

    // تحديث الإحصائيات
    updateStats(reward) {
        this.stats.totalReward += reward;
        this.stats.episodeRewards.push(reward);
        
        if (this.stats.episodeRewards.length > 100) {
            this.stats.episodeRewards.shift();
        }
        
        this.stats.averageReward = this.stats.episodeRewards.reduce((a, b) => a + b, 0) / 
            this.stats.episodeRewards.length;
        
        this.stats.explorationRate = this.epsilon;
    }

    // تدريب النظام
    async train(batchSize = null) {
        if (this.memory.length < this.miniBatchSize) return;
        
        batchSize = batchSize || this.miniBatchSize;
        const batch = this.sampleBatch(batchSize);
        
        // تحديث الشبكة الرئيسية
        for (const experience of batch) {
            const target = await this.calculateTarget(experience);
            await this.mainNetwork.train(experience.state, target);
        }
        
        // تحديث الشبكة الهدف
        this.steps++;
        if (this.steps % this.targetUpdateFreq === 0) {
            this.updateTargetNetwork();
        }
        
        // تحديث معدل الاستكشاف
        this.updateEpsilon();
    }

    // اختيار عينة من الذاكرة
    sampleBatch(batchSize) {
        const batch = [];
        const probabilities = this.calculateSamplingProbabilities();
        
        for (let i = 0; i < batchSize; i++) {
            const index = this.weightedRandomChoice(probabilities);
            batch.push(this.memory[index]);
        }
        
        return batch;
    }

    // حساب احتمالات الاختيار
    calculateSamplingProbabilities() {
        const priorities = this.memory.map(exp => exp.priority);
        const sum = priorities.reduce((a, b) => a + b, 0);
        return priorities.map(p => p / sum);
    }

    // حساب القيمة الهدف
    async calculateTarget(experience) {
        const currentQ = await this.mainNetwork.predict(experience.state);
        const nextQ = await this.targetNetwork.predict(experience.nextState);
        
        const target = [...currentQ];
        const nextValue = experience.done ? 0 : this.gamma * Math.max(...nextQ);
        target[experience.action] = experience.reward + nextValue;
        
        return target;
    }

    // تحديث الشبكة الهدف
    updateTargetNetwork() {
        const mainNetworkData = this.mainNetwork.save();
        this.targetNetwork.load(mainNetworkData);
    }

    // تحديث معدل الاستكشاف
    updateEpsilon() {
        this.epsilon = Math.max(
            this.epsilonMin,
            this.epsilon * this.epsilonDecay
        );
    }

    // توليد ضوضاء غاوسية
    gaussianNoise(mean = 0, stddev = 1) {
        const u1 = 1 - Math.random();
        const u2 = 1 - Math.random();
        const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
        return mean + stddev * randStdNormal;
    }

    // تطبيع حالة اللعبة
    normalizeState(state) {
        const normalized = {};
        for (const key in state) {
            if (typeof state[key] === 'number') {
                normalized[key] = (state[key] - this.getMinValue(key)) / 
                    (this.getMaxValue(key) - this.getMinValue(key));
            }
        }
        return normalized;
    }

    // الحصول على الحد الأدنى للقيمة
    getMinValue(key) {
        const mins = {
            health: 0,
            energy: 0,
            resources: 0,
            threat: 0,
            exploration: 0
        };
        return mins[key] || 0;
    }

    // الحصول على الحد الأقصى للقيمة
    getMaxValue(key) {
        const maxs = {
            health: 100,
            energy: 100,
            resources: 1000,
            threat: 1,
            exploration: 1
        };
        return maxs[key] || 1;
    }

    // الحصول على مؤشر الإجراء
    getActionIndex(action) {
        const actions = ['EXPLORE', 'GATHER', 'COMBAT', 'FLEE', 'BUILD'];
        return actions.indexOf(action);
    }

    // الحصول على إحصائيات التعلم
    getStats() {
        return {
            ...this.stats,
            memorySize: this.memory.length,
            learningRate: this.learningRate,
            gamma: this.gamma,
            epsilon: this.epsilon
        };
    }
}
