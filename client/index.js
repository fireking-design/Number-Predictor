const calculateInputs = (context, width, height, dx, dy) => {

    const grayScaleImage = [...Array(height)].map(() => [...Array(width)].fill(0));
    const inputs = [...Array(width * height)].fill(0);

    const calculateGrayScaleImage = (context, width, height, dx, dy) => {
        for (let y = 0; y < width; y++) {
            for (let x = 0; x < height; x++) {
                const pixels = context.getImageData(x * dx, y * dy, dx, dy);
                for (let vy = 0; vy < pixels.height; vy++) {
                    for (let vx = 0; vx < pixels.width; ++vx) {
                        grayScaleImage[y][x] += pixels.data[(vy * dy + vx) * 4 + 3] / (255 * 784)
                    }
                }
            }
        }

        return grayScaleImage;
    }

    const centreImage = () => {
        let meanX = 0;
        let meanY = 0;
        let sumPixels = 0;
        for (let y = 0; y < width; y++) {
            for (let x = 0; x < height; x++) {
                meanX += x * grayScaleImage[y][x];
                meanY += y * grayScaleImage[y][x];
                sumPixels += grayScaleImage[y][x]
            }
        }
        meanX /= sumPixels;
        meanY /= sumPixels;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        let pixels = context.getImageData(0, 0, width, height);
        
        for (let y = 0; y < width; ++y) {
            for (let x = 0; x < height; ++x) {
                pixels.data[(y * width + x) * 4 + 3] = grayScaleImage[y][x] * 255;
            }
        }

        context.putImageData(pixels, Math.round((width / 2) - meanX), Math.round((height / 2) - meanY));

        calculateGrayScaleImage(context, 28, 28, 28, 28)
    }

    

    const calculateInputs = () => {

        calculateGrayScaleImage(context, width, height, dx, dy);

        centreImage();

        for (let y = 0; y < width; ++y) {
            for (let x = 0; x < height; ++x) {
                inputs[y * width + x] = grayScaleImage[y][x];
            }
        }

        return inputs;
    }

    return calculateInputs();
}

const initCanvas = predict => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext("2d");

    const { width, height } = canvas;

    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = 2 * 28;

    let isDrawing = false;
    let clearBeforeDraw = false;
    let paths = [];
    let prevX = 0;
    let prevY = 0;
    let currentX = 0;
    let currentY = 0;

    canvas.addEventListener('mousedown', e => {
        if (clearBeforeDraw) {
            context.clearRect(0, 0, width, height);
            paths = [];
            clearBeforeDraw = false;
        }
        // TODO --- See example number predictor for more complete position finder
        [currentX, currentY] = [e.offsetX * width / 200, e.offsetY * height / 200];
        context.beginPath();
        context.arc(currentX, currentY, context.lineWidth / 4, 0, Math.PI * 2)
        context.stroke();
        context.closePath();
        context.fill();
        paths.push([[currentX], [currentY]])
        isDrawing = true
    });

    canvas.addEventListener('mouseup', () => isDrawing = false);

    canvas.addEventListener('mouseout', () => isDrawing = false);

    canvas.addEventListener('mousemove', e => {
        if (!isDrawing) return;
        [prevX, prevY] = [currentX, currentY];
        [currentX, currentY] = [e.offsetX * width / 200, e.offsetY * height / 200];
        const currentPath = paths[paths.length - 1];
        // TODO --- Use objects instead of arrays
        currentPath[0].push(currentX);
        currentPath[1].push(currentY);
        paths[paths.length - 1] = currentPath;
        context.beginPath();
        context.strokeStyle = 'black';
        context.lineWidth = 2 * 28;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.moveTo(prevX, prevY);
        context.lineTo(currentX, currentY);
        context.stroke();
        context.closePath();
    })

    document.getElementById('predict').addEventListener('click', () => {
        const inputs = calculateInputs(context, 28, 28, 28, 28);
        document.getElementById('prediction').innerHTML = predict(inputs);
        clearBeforeDraw = true;
    })
};

const fetchNetwork = async () => (await (await fetch('/data/weights.json')).json());

const predict = ({ weights, biases }) => inputs => {

    console.log(JSON.parse(JSON.stringify(inputs)));

    const sigmoid = z => math.dotDivide(1, math.add(1, math.exp(math.multiply(-1, z))))

    const networkSize = weights.length;

    for (let layerIndex = 0; layerIndex < networkSize; ++layerIndex) { // layers
        inputs = sigmoid(math.add(math.multiply(weights[layerIndex].data, inputs), biases[layerIndex].data));
    }

    inputs = inputs.valueOf();

    console.log(JSON.parse(JSON.stringify(inputs)));

    return inputs.indexOf(Math.max(...inputs));
}

fetchNetwork().then(network => initCanvas(predict(network)))