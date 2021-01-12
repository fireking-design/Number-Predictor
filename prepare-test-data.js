const { readFileSync, writeFileSync } = require('fs');
const math = require('mathjs');

(async () => {
    const testData = readFileSync('data/mnist_test.csv', 'utf8').split('\n');
    testData.pop();
    const test = testData.map(data => {
        data = data.split(',');
        const outputs = math.zeros([10])
        outputs[data.shift()] = 1
        const inputs = data.map(x => (+x) / 255);
        return {
            inputs,
            outputs
        };
    })
    writeFileSync('client/data/test-data.json', JSON.stringify(test));
})()