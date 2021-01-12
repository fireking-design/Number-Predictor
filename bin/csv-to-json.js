const { createReadStream, writeFile } = require('fs')
const yargs = require('yargs');

const options = yargs
    .usage('Usage: -f | --file <FileName> string')
    .option('f', { alias: 'file', describe: 'Which file to convert', type: 'string', demandOption: true })
    .option('o', { alias: 'outputPosition', describe: 'Output position | default is end', type: 'string', demandOption: true, choices: ['start', 'end'] })
    .option('n', { alias: 'newFile', describe: 'New file to put data in', type: 'string', demandOption: false })
    .option('h', { alias: 'highout', describe: 'Highest output', type: 'number', demandOption: true })
    .argv;

(async () => {
    const stream = createReadStream(options.file, { encoding: 'UTF-8', highWaterMark: 10000000 }); //10MB
    let finalData = [];
    for await (const data of stream) {
        let dataArray = data.split('\n');
        dataArray.pop();
        dataArray = dataArray.map((data, i) => {
            const inputs = data.split(',').map(number => +number);

            const outputs = [...Array(options.highout)].fill(0);
            const output = options.outputPosition === 'start' ? inputs.shift() - 1 : inputs.pop() - 1;
            outputs[output] = 1;

            if (i == 0) console.log(output);

            return {
                inputs, 
                outputs
            }
        });
        finalData.push(...dataArray);
    }

    options.newFile = options.newFile || options.file.replace('csv', 'json');

    writeFile(options.newFile, JSON.stringify(finalData), (err) => {
        if (err) throw err;
        console.log('Written data to -> ' + options.newFile)
    })
})()