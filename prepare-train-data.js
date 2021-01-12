const { readFileSync, writeFileSync } = require('fs');
const math = require('mathjs');

(async () => {
    const trainData = readFileSync('data/mnist_train.csv', 'utf8').split('\n');
    trainData.pop();
    const train = trainData.map(data => {
        data = data.split(',');
        const outputs = math.zeros([10])
        outputs[data.shift()] = 1
        const inputs = data.map(x => (+x) / 255);
        return {
            inputs,
            outputs
        };
    })
    writeFileSync('client/data/train-data.json', JSON.stringify(train.splice(0, 50000)));
    writeFileSync('client/data/validate-data.json', JSON.stringify(train));
})()