const yargs = require('yargs');

const options = yargs
    .option('t', { alias: 'type', describe: 'Which neural-network do you want to train', demandOption: true, choices: ['basic', 'matrix', 'medium'] })
    .option('f', { alias: 'file', describe: 'Which file to train on', type: 'string', demandOption: true })
    .option('d', { alias: 'testfile', describe: 'Which file to test on', type: 'string', demandOption: true })
    .option('v', { alias: 'validationfile', describe: 'Which file to validate on', type: 'string', demandOption: true })
    .option('l', { alias: 'layers', describe: 'Layers of the network - currently supporting only 3', type: 'array', demandOption: true, array: true })
    .option('e', { alias: 'epochs', describe: 'How long to train the network for', demandOption: true, type: 'number' })
    .option('m', { alias: 'miniBatchSize', describe: 'How big the mini batches are', demandOption: true, type: 'number' })
    .option('r', { alias: 'learningRate', describe: 'The rate the network learns', demandOption: true, type: 'number' })
    .option('b', { alias: 'lambda', describe: 'The weight decay rate', demandOption: true, type: 'number' })
    .option('s', { alias: 'save', describe: 'To save or not to save, that is the question! :)', demandOption: true, type: 'boolean', boolean: true })
    .argv;

const backToNP = '../../'

const { Network } = require(`./neural-network-${options.type}.js`);

const trainingData = require(backToNP + options.file);
const testingData = require(backToNP + options.testfile);
const validatingData = require(backToNP + options.validationfile);

const network = Network(options.layers);

network.train({ trainingData, testingData, validatingData }, options)

// console.log(testingData)

// node bin/networks/neural-network -t medium -f ./data/wine-quality.json -tf ./data/wine-quality.json -vf ./data/wine-quality.json -l [13, 20, 3] -e 20 -mbs 10 -lr 0.5 -lbd 0.1 -s false