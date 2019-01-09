// Generate documentation from the routetree.json file provided by Hybrixd
//
// Steps:
//      - obtain the routetree.json file
//      - parse the file
//      - output docs
//
// How to run this file:
//
//  $ npm run generate_docs
//
// Invoke this command from the project path

// libraries
var fs = require("fs");

const inputFilename = '../node/lib/router/routetree.json';
const outputFilename = 'docs/docs-hybrixd-api.txt';
const EOL = require('os').EOL;
const docsDir = 'docs';

console.log('Hybrixd documentation generator');
console.log('This tool generates documentation from the "routetree.json" file provided by Hybrixd.\n');

console.log('Generating documentation from file %s', inputFilename);
console.log('Writing documentation to file %s', outputFilename);

// create the directory docs if it doesn't exist
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
}

const inputJson = JSON.parse(fs.readFileSync(inputFilename));

const stream = fs.createWriteStream(outputFilename);
let output = '';

function addItem(path, description) {
    output += 'GET /' + path + '\t\t' + description + EOL;
}

// start with the general help message
output += inputJson['_help'] + EOL + EOL;

for (const outerKey in inputJson) {
    // look for subkey called "_this"
    // these are valid operations
    if (inputJson.hasOwnProperty(outerKey)) {
        const subkey = inputJson[outerKey];

        if ('object' === typeof subkey && subkey.hasOwnProperty('_this')) {
            addItem(outerKey, subkey['_this']);
        }
    }
}

stream.once('open', function (fd) {
    stream.write(output);
    stream.end();
});

console.log(EOL + ' [OK] Done.' + EOL);