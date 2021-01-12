const correctTable = document.getElementById('correct');
const wrongTable = document.getElementById('wrong');

const predict = ({ weights, biases }) => inputs => {

    const sigmoid = z => math.dotDivide(1, math.add(1, math.exp(math.multiply(-1, z))))

    const networkSize = weights.length;

    for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
        inputs = sigmoid(math.add(math.multiply(weights[layerIndex].data, inputs), biases[layerIndex].data));
    }

    inputs = inputs.valueOf();

    const predictions = [];

    const constantInputs = [...inputs];

    while (inputs.length) {
        const highestInputIndex = constantInputs.indexOf(Math.max(...inputs))
        predictions.push(highestInputIndex);
        inputs.splice(inputs.indexOf(Math.max(...inputs)), 1);
    }

    return predictions;
}

const fetchNetwork = async () => (await (await fetch('/data/weights.json')).json());

const fetchTestData = async () => (await (await fetch('/data/test-data.json')).json());

fetchNetwork().then(({ weights, biases }) => {
    const newPredict = predict({ weights, biases });
    fetchTestData().then(testData => {
        testData.forEach(testData => {
            const predictions = newPredict(testData.inputs);
            const canvas = document.createElement('canvas');
            canvas.width = 28;
            canvas.height = 28;
            const context = canvas.getContext('2d');
            const pixels = context.getImageData(0, 0, 28, 28);
            testData.inputs.forEach((input, i) => pixels.data[i * 4 + 3] = (input * 255));
            context.putImageData(pixels, 0, 0);
            const row = document.createElement('tr');
            const col1 = document.createElement('td');
            const col2 = document.createElement('td');
            col1.appendChild(canvas);
            col2.innerHTML = predictions
            row.appendChild(col1);
            row.appendChild(col2);
            if (predictions[0] === testData.outputs.indexOf(Math.max(...testData.outputs))) {
                correctTable.appendChild(row)
            } else {
                wrongTable.appendChild(row)
            }
        })
    })
})