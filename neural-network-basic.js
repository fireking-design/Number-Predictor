const { readFileSync, writeFileSync } = require('fs');

const mnistDataGeneration = async () => {

    // const network = require('./weights.json');

    let train = [];
    let test = [];

    const data = readFileSync('data/mnist_train.csv', 'utf8').split('\n');

    data.pop();

    data.map(data => {
        data = data.split(',');
        const output = Array(10).fill(0);
        output[data.shift()] = 1
        const input = data.map(x => (+x) / 255);

        train.push({ output, input });
    })

    const testData = readFileSync('data/mnist_test.csv', 'utf8').split('\n');

    testData.pop();

    testData.map(data => {
        data = data.split(',');
        const output = Array(10).fill(0);
        output[data.shift()] = 1
        const input = data.map(x => (+x) / 255);

        test.push({input, output});
    })

    return {
        train,
        test,
        // network
    }
}

const Network = layers => {
    const network = layers.slice(1).map((layer, layerIndex) => { // layers
        return [...Array(layer)].map(() => { // neuron
            return {
                weights: [...Array(layers[layerIndex])].map(() => Math.random() * (1 - -1) - 1), // weights
                bias: Math.random() * (1 - -1) - 1,
                nablaWeights: [...Array(layers[layerIndex])].fill(0), 
                nablaBias: 0, 
                deltaNablaWeights: [...Array(layers[layerIndex])].fill(0), 
                deltaNablaBias: 0, 
                activation: 0, 
                z: 0
            }
        })
    })

    const shuffle = array => {
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    const sigmoid = value => 1 / (Math.exp(-value) + 1);

    const sigmoidDirivative = output => output * (1 - output);

    const feedForward = inputs => {
        const networkSize = network.length;
        for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
            const layer = network[layerIndex];
            const layerSize = layer.length;
            const newInputs = []
            for (let neuronIndex = 0; neuronIndex < layerSize; ++neuronIndex) { // neurons
                const neuron = layer[neuronIndex];
                let neuronTotal = neuron.bias;
                for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) { // weights
                    neuronTotal += neuron.weights[weightIndex] * inputs[weightIndex];
                }
                neuron.z = neuronTotal
                const activation = sigmoid(neuronTotal);
                neuron.activation = activation;
                newInputs.push(activation);
            }
            inputs = newInputs;
        }
        return inputs;
    }

    const backPropogation = (inputs, ideal) => {
        const actual = feedForward(inputs);
        let deltaVector = [];
        for (let neuronIndex = 0; neuronIndex < network[network.length - 1].length; ++neuronIndex) {
            const neuron = network[network.length - 1][neuronIndex];
            deltaVector[neuronIndex] = (actual[neuronIndex] - ideal[neuronIndex]) * sigmoidDirivative(neuron.activation);
            neuron.deltaNablaBias = deltaVector[neuronIndex];
            for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) {
                if (network.length - 2 < 0) {
                    neuron.deltaNablaWeights[weightIndex] = deltaVector[neuronIndex] * inputs[weightIndex];
                } else {
                    neuron.deltaNablaWeights[weightIndex] = deltaVector[neuronIndex] * network[network.length - 2][weightIndex].activation;
                }
            }
        }
        for (let layerIndex = network.length - 2; layerIndex >= 0; --layerIndex) {
            const newDeltaVector = [...Array(network[layerIndex].length)].fill(0);
            for (let neuronIndex = 0; neuronIndex < network[layerIndex].length; ++neuronIndex) {
                const neuron = network[layerIndex][neuronIndex];
                for (let nextNeuronIndex = 0; nextNeuronIndex < deltaVector.length; ++nextNeuronIndex) {
                    newDeltaVector[neuronIndex] += deltaVector[nextNeuronIndex] * neuron.weights[nextNeuronIndex];
                }
                newDeltaVector[neuronIndex] *= sigmoidDirivative(neuron.activation);
                neuron.deltaNablaBias = newDeltaVector[neuronIndex];
                for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) {
                    if (layerIndex - 1 < 0) {
                        neuron.deltaNablaWeights[weightIndex] = newDeltaVector[neuronIndex] * inputs[weightIndex];
                    } else {
                        neuron.deltaNablaWeights[weightIndex] = newDeltaVector[neuronIndex] * network[layerIndex - 1][weightIndex].activation;
                    }
                }
            }
            deltaVector = newDeltaVector;
        }
    }

    const updateMiniBatch = (miniBatch, learningRate) => {
        const networkSize = network.length;
        for (let dataIndex = 0; dataIndex < miniBatch.length; ++dataIndex) {
            const data = miniBatch[dataIndex];
            const inputs = data.input;
            const ideal = data.output;
            backPropogation(inputs, ideal);
            for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
                const layer = network[layerIndex];
                const layerSize = layer.length;
                for (let neuronIndex = 0; neuronIndex < layerSize; ++neuronIndex) { // neurons
                    const neuron = layer[neuronIndex];
                    neuron.nablaBias += neuron.deltaNablaBias;
                    neuron.deltaNablaBias = 0;
                    for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) { // weights
                        neuron.nablaWeights[weightIndex] += neuron.deltaNablaWeights[weightIndex];
                        neuron.deltaNablaWeights[weightIndex] = 0;
                    }
                }
            }
        }
        for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
            const layer = network[layerIndex];
            const layerSize = layer.length;
            for (let neuronIndex = 0; neuronIndex < layerSize; ++neuronIndex) { // neurons
                const neuron = layer[neuronIndex];
                neuron.bias -= ((learningRate / miniBatch.length) * neuron.nablaBias);
                neuron.nablaBias = 0;
                for (let weightIndex = 0; weightIndex < neuron.weights.length; ++weightIndex) { // weights
                    neuron.weights[weightIndex] -= ((learningRate / miniBatch.length) * neuron.nablaWeights[weightIndex]);
                    neuron.nablaWeights[weightIndex] = 0;
                }
            }
        }
    }

    const predict = data => {
        return data.map(data => {
            const output = feedForward(data.input);
            const actual = output.indexOf(Math.max(...output)) + 1;
            const ideal = data.output.indexOf(1) + 1;
            return {
                actual,
                ideal
            }
        }).reduce((acc, data) => data.actual === data.ideal ? acc +  1 : acc, 0) / data.length
    }

    const train = (trainingData, epochs, miniBatchSize, learningRate, testingData) => {
        const trainingDataLength = trainingData.length;
        console.log('Training...');
        for (let epochIndex = 0; epochIndex < epochs; ++epochIndex) {
            trainingData = shuffle(trainingData);
            for (let batchIndex = 0; batchIndex < trainingDataLength; batchIndex += miniBatchSize) {
                if(!(batchIndex % 1500)) console.log(`Batch index ${batchIndex}`);
                const miniBatch = trainingData.slice(batchIndex, batchIndex + miniBatchSize);
                updateMiniBatch(miniBatch, learningRate);
            }
            if (testingData) {
                console.log(`Epoch ${epochIndex} ${predict(testingData) * testingData.length} / ${testingData.length}`);
            } else {
                console.log(`Epoch ${epochIndex}`);
            }
        }
        // writeFileSync('/client/data/weights.json', JSON.stringify(network));
    }

    return {
        train, 
        predict
    }
}

mnistDataGeneration().then(value => {
    const { train } = Network([784, 100, 10]);
    const epochs = 3;
    const miniBatchSize = 10;
    const learningRate = 3;
    train(value.train, epochs, miniBatchSize, learningRate, value.test);
});