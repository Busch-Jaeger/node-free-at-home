#!/usr/bin/env node

const OpenAPI = require('openapi-typescript-codegen');

const help = `
Usage: generate.js <options>

Options:

 -i     (optional, default = ./spec ) source of the yaml files. 
        Either a directory with the files or the URL of a sysap http://<ip>

 -o     (optional, default = ./src ) target directory fpr generation
`

console.log('Generate addon api...')
const commonOptions = {
    useUnionTypes: true,
    httpClient: 'node',
    request: './src/core/request.ts'
}

let input = './specs';
let output = './src';
const args = process.argv;

function exitWithError(error) {
    console.error(error);
    process.exit(1);
}

for (let i = 2; i < args.length; i++) {
    if (args[i] === '-i') {
        if (!args[i+1] || args[i+1].startsWith('-')) {
            exitWithError('missing input value');
        }
        input = args[i+1];
        i++; // NOSONAR
    } else if (args[i] === '-o') {
        if (!args[i+1] || args[i+1].startsWith('-')) {
            exitWithError('missing output value');
        }
        output = args[i+1];
        i++; // NOSONAR
    } else if (args[i] === '--help') {
        console.log(help);
        process.exit(0);
    } else {
        exitWithError('wrong argument: ' + args[i]);
    }
}

const useHttp = input.startsWith('http://');

const apis = [
    {
        input: useHttp ? `${input}/api/addon/v1/openapi.yaml` : `${input}/addon.yaml`,
        output: `${output}/addon`,
        clientName: 'AddonClient'
    }, {
        input: useHttp ? `${input}/api/serial/v1/openapi.yaml` : `${input}/serial.yaml`,
        output: `${output}/serial`,
        clientName: 'SerialClient'
    }, {
        input: useHttp ? `${input}/api/rpc/v1/openapi.yaml` : `${input}/rpc.yaml`,
        output: `${output}/rpc`,
        clientName: 'RpcClient'
    }, {
        input: useHttp ? `${input}/fhapi/v1/openapi.yaml` : `${input}/fhapi.yaml`,
        output: `${output}/fhapi`,
        clientName: 'FahClient'
    }
]

for (const api of apis) {
    console.log(`generate ${api.output} from ${api.input}`);
    OpenAPI.generate(Object.assign({}, commonOptions, api));
}