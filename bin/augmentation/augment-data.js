const { writeFile } = require('fs')

const yargs = require('yargs');

const { translate, rotate, skew, elastic } = require('./augment-functions.js');

const options = yargs
    .usage('Usage: -s | --set <test | train | validate> -t | --type <translate | rotate | elastic | skew>')
    .option('s', { alias: 'set', describe: 'Test, train or validate?', type: 'string', demandOption: true, choices: ['test', 'train', 'validate'] })
    .option('t', { alias: 'type', describe: 'Translate, rotate, elastic or skew?', type: 'string', demandOption: true, choices: ['translate', 'rotate', 'elastic', 'skew'] })
    .argv

let data = require(`./client/data/${options.set}-data.json`);

const oldData = data[0];

switch (options.type) {
    case 'translate':
        data = translate(data);
        break;
    case 'rotate':
        rotate(data);
        break;
    case 'skew':
        skew(data);
        break;
    case 'elastic':
        elastic(data);
        break;
    default:
        throw new Error(`Unknown transformation type: ${options.type}. Check you used on of these. <translate | rotate | elastic | skew>`);
}

console.log(oldData, data[0]);

writeFile(`./client/data/${options.set}-${options.type}-data.json`, JSON.stringify(data), (err) => {if (err) throw err});