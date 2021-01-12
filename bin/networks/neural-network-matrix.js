const { writeFileSync } = require('fs');

const math = require('mathjs');

const Network = layers => {
    let weights = [...Array(layers.length - 1)].map((_, i) => math.random([layers[i + 1], layers[i]], -0.1, 0.1));
    let biases = [...Array(layers.length - 1)].map(((_, i) => math.random([layers[i + 1]], -0.1, 0.1)));

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

    const sigmoid = z => math.dotDivide(1, math.add(1, math.exp(math.multiply(-1, z))))

    const sigmoidDirivative = activation => math.dotMultiply(activation, math.subtract(1, activation));

    const feedForward = inputs => {
        const networkSize = layers.length - 1;
        for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
            inputs = sigmoid(math.add(math.multiply(weights[layerIndex], inputs), biases[layerIndex]));
        }
        return inputs;
    }

    const backPropogation = (inputs, ideal) => {

        let deltaWeights = [...Array(layers.length - 1)].map((_, i) => math.zeros([layers[i + 1], layers[i]]));
        let deltaBiases = [...Array(layers.length - 1)].map(((_, i) => math.zeros([layers[i + 1]])));

        let activation = inputs;
        let activations = [inputs];
        let zs = [];

        const networkSize = layers.length - 1;
        for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
            const z = math.add(math.multiply(weights[layerIndex], activation), biases[layerIndex]);
            zs.push(z);
            activation = sigmoid(z);
            let newActivation = math.matrix(activation);
            math.reshape(newActivation, [newActivation.size()[0], 1]);
            activations.push(newActivation);
        }

        let deltaVector = math.dotMultiply(math.subtract(math.flatten(activations[activations.length - 1]), ideal), math.flatten(sigmoidDirivative(activations[activations.length - 1])));
        deltaVector = math.reshape(deltaVector, [deltaVector.size()[0], 1])
        deltaBiases[deltaBiases.length - 1] = deltaVector
        deltaWeights[deltaWeights.length - 1] = math.multiply(deltaVector, math.transpose(activations[activations.length - 2]));

        for (let layerIndex = deltaBiases.length - 2; layerIndex >= 0; --layerIndex) {
            deltaVector = math.dotMultiply(math.multiply(math.transpose(weights[layerIndex + 1]), deltaVector), sigmoidDirivative(activations[layerIndex + 1]))
            deltaVector = math.reshape(deltaVector, [deltaVector.size()[0], 1])
            deltaBiases[layerIndex] = deltaVector;
            deltaWeights[layerIndex] = math.multiply(deltaVector, math.transpose(math.reshape(math.matrix(activations[layerIndex]), [activations[layerIndex].length, 1])));
        }

        return { deltaWeights, deltaBiases };
    }

    const updateMiniBatch = (miniBatch, learningRate) => {
        let newWeights = [...Array(layers.length - 1)].map((_, i) => math.zeros([layers[i + 1], layers[i]]));
        let newBiases = [...Array(layers.length - 1)].map(((_, i) => math.zeros([layers[i + 1]])));
        for (let dataIndex = 0; dataIndex < miniBatch.length; ++dataIndex) {
            const data = miniBatch[dataIndex];
            const { deltaWeights, deltaBiases } = backPropogation(data.input, data.output);
            newWeights = [...Array(layers.length - 1)].map((_, i) => math.add(newWeights[i], deltaWeights[i]));
            newBiases = [...Array(layers.length - 1)].map((_, i) => math.add(newBiases[i], math.flatten(deltaBiases[i])));
        }

        weights = [...Array(layers.length - 1)].map((_, i) => math.subtract(weights[i], math.dotMultiply(learningRate / miniBatch.length, newWeights[i])));
        biases = [...Array(layers.length - 1)].map((_, i) =>  math.subtract(biases[i], math.dotMultiply(learningRate / miniBatch.length, newBiases[i])));
    }

    const predict = data => {
        return data.map(data => {
            const output = feedForward(data.input).valueOf();
            const actual = output.indexOf(Math.max(...output)) + 1;
            const ideal = data.output.indexOf(1) + 1;
            return {
                actual,
                ideal
            }
        }).reduce((acc, data) => data.actual === data.ideal ? acc +  1 : acc, 0) / data.length
    }

    const train = (trainingData, epochs, miniBatchSize, learningRate, testingData, save) => {
        console.log('Training');
        const trainingDataLength = trainingData.length;
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
        if(save) writeFileSync('client/data/weights.json', JSON.stringify({ weights, biases }));
    }

    return {
        train, 
        predict
    }
}

module.exports = { Network }