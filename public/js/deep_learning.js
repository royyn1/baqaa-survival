class DeepLearningAI {
    constructor() {
        this.mainNetwork = this.createNetwork();
        this.targetNetwork = this.createNetwork();
        this.memory = [];
        this.batchSize = 32;
        this.gamma = 0.99;
        this.explorationRate = 1.0;
        this.minExplorationRate = 0.01;
        this.explorationDecay = 0.995;
    }

    createNetwork() {
        return {
            layers: [
                { size: 10, weights: this.initializeWeights(10, 64) },
                { size: 64, weights: this.initializeWeights(64, 32) },
                { size: 32, weights: this.initializeWeights(32, 4) }
            ]
        };
    }

    initializeWeights(inputSize, outputSize) {
        return Array.from({ length: inputSize }, () =>
            Array.from({ length: outputSize }, () => Math.random() * 2 - 1)
        );
    }

    forward(state, network) {
        let activation = state;
        for (const layer of network.layers) {
            activation = this.matrixMultiply(activation, layer.weights);
            activation = activation.map(x => Math.max(0, x)); // ReLU activation
        }
        return activation;
    }

    matrixMultiply(input, weights) {
        return weights[0].map((_, col) =>
            input.reduce((sum, val, row) => sum + val * weights[row][col], 0)
        );
    }

    predict(state) {
        if (Math.random() < this.explorationRate) {
            return Math.floor(Math.random() * 4);
        }
        const qValues = this.forward(state, this.mainNetwork);
        return qValues.indexOf(Math.max(...qValues));
    }

    remember(state, action, reward, nextState) {
        this.memory.push({ state, action, reward, nextState });
        if (this.memory.length > 10000) {
            this.memory.shift();
        }
    }

    train() {
        if (this.memory.length < this.batchSize) return;

        const batch = this.sampleMemory();
        this.updateNetwork(batch);
        this.updateExplorationRate();
    }

    sampleMemory() {
        const indices = Array.from({ length: this.batchSize }, () =>
            Math.floor(Math.random() * this.memory.length)
        );
        return indices.map(i => this.memory[i]);
    }

    updateNetwork(batch) {
        // Implementation of network update using batch learning
        // This is a simplified version - in practice, you'd use proper backpropagation
        batch.forEach(experience => {
            const { state, action, reward, nextState } = experience;
            const target = this.calculateTarget(reward, nextState);
            // Update weights here
        });
    }

    calculateTarget(reward, nextState) {
        const nextQValues = this.forward(nextState, this.targetNetwork);
        return reward + this.gamma * Math.max(...nextQValues);
    }

    updateExplorationRate() {
        this.explorationRate = Math.max(
            this.minExplorationRate,
            this.explorationRate * this.explorationDecay
        );
    }

    updateTargetNetwork() {
        this.targetNetwork = JSON.parse(JSON.stringify(this.mainNetwork));
    }
}

// تصدير الكلاس للاستخدام في ملفات أخرى
window.DeepLearningAI = DeepLearningAI;
