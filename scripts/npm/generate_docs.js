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

function levelTabs(numLevels) {
    let output = '';

    if (!isNumber(numLevels) || numLevels < 0)
        return output;

    for (let i = 0; i < numLevels; i++) {
        output += '\t';
    }

    return output;
}

function arrayToPathString(path) {
    let output = '';

    if (Array.isArray(path)) {
        path.forEach(function (item) {
                output += item + '/';
            }
        );
    }

    return output;
}

function isNumber(param) {
    return 'number' === typeof(param);
}

function repeatSpaces(num) {
    if(isNumber(num) && num > 0) {
        let output = '';

        for(let i = 0; i < num; i++) {
            output += ' ';
        }

        return output;
    }

    return '';
}

function padStringToCharacters(stringToMeasure, padding) {
    if(isString(stringToMeasure)) {
        return repeatSpaces(padding - stringToMeasure.length);
    }

    return '';
}

function addItem(path, description, level) {
    const part1 = levelTabs(level) + 'GET /' + arrayToPathString(path);

    output += part1;
    output += padStringToCharacters(part1, 50) + description + EOL;
}

// start with the general help message
output += inputJson['_help'] + EOL + EOL;

// now browse through the top level keys
function isObject(param) {
    return 'object' === typeof (param);
}

function isString(param) {
    return 'string' === typeof (param);
}

// level: 0
for (const level0Key in inputJson) {
    // look for subkey called "_this"
    // these are valid operations
    if (inputJson.hasOwnProperty(level0Key)) {
        const level1Key = inputJson[level0Key];

        if (isObject(level1Key) && level1Key.hasOwnProperty('_this')) {
            addItem([level0Key], level1Key['_this'], 0);

            // level: 1
            // go through the entries underneath the '_ref' object
            const refObject = level1Key['_ref'];

            if (isObject(refObject)) {
                // level: 2
                for (const level2Key in refObject) {
                    if (isString(level2Key) && !level2Key.startsWith('_')) {
                        const level2Object = refObject[level2Key];

                        if(isObject(level2Object)) {
                            // internal levels do not correspond 1-1 to the generated levels
                            let level2ObjectDescription = level2Object['_this'] || level2Object['_ref']['_this'];

                            addItem([level0Key, level2Key], level2ObjectDescription, 1);
                        }
                    }
                }
            }
        }
    }
}

// write the docs to a file
stream.once('open', function (fd) {
    stream.write(output);
    stream.end();
});

console.log(EOL + ' [OK] Done.' + EOL);