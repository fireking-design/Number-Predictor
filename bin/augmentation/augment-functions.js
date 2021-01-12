const translate = data => {
    console.log('translate', data.length)
    const possibleTranslations = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    
    const newData = [];

    data.forEach(row => [possibleTranslations[Math.floor(Math.random() * 4)], possibleTranslations[Math.floor(Math.random() * 4)]].forEach(translation => {
        const newRow = {
            inputs: [...Array(784)].fill(0), 
            outputs: row.outputs
        }
        row.inputs.forEach((pixel, index) => {
            const newIndex = (Math.floor(index / 28) + translation[1]) * 28 + ((index % 28) + translation[0]);
            if (newIndex < 0 || newIndex >= 724) return;
            newRow.inputs[newIndex] = pixel
        })
        newData.push(newRow);
    }))

    return newData;
}

const rotate = data => {
    console.log('rotate', data.length)
}

const skew = data => {
    console.log('skew', data.length)
}

const elastic = data => {
    console.log('elastic', data.length)
}

module.exports = {
    translate, 
    rotate, 
    skew, 
    elastic
}