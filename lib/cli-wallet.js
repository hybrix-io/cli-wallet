const Hybrix = require('../interface/hybrix-lib.nodejs.js');
const hybrixd = new Hybrix.Interface({http: require('http'), https: require('https'), storage: './storage'});
const ProgressBar = require('progress');
const stdio = require('stdio');
const fs = require('fs');
const setup = require('./setup');

const CURSOR_CONTROL_UP = '\x1B[1A';

let bar;

function makeProgressBar (title) {
  bar = new ProgressBar('[.] ' + title + ': [:bar] :percent, eta: :etas', {
    complete: '▓',
    incomplete: '░',
    width: 76 - title.length,
    total: 100
  });
}

const methods = {};
// Loop through all the files in the methods directory
fs.readdir('./lib/methods', function (err, files) {
  if (err) {
    console.error('[!] Could not list the methods directory.', err);
    process.exit(1);
  }
  files.forEach(function (file, index) {
    if (file.endsWith('.js')) {
      const id = file.split('.')[0];
      methods[id] = require('./methods/' + id);
    }
  });
  main();
});

const stringify = x => typeof x === 'string' ? x : JSON.stringify(x);

const dataCallback = ops => data => {
  if (!ops.quiet) {
    setTimeout(function () { // timeout to ensure bar is updated to 100% properly
      process.stdout.write(CURSOR_CONTROL_UP); // move cursor up one line (solves progress meter bug)
      bar.update(1);
      console.log('\n' + stringify(data) + '\n');
    }, 200);
  } else console.log(stringify(data));
};

const errorCallback = ops => error => {
  try {
    error = JSON.parse(error);
  } catch (e) {}
  if (error instanceof Error) error = ops.verbose ? error.stack : error.toString();
  const errorMsg = error && error.help
    ? error.help.replace(/<br\/>/g, '\n')
    : error;

  if (ops.quiet) console.error(stringify(errorMsg));
  else console.error('\n\n' + '[!] Error: ' + stringify(errorMsg));
  process.exit(1);
};

const progressCallback = ops => progress => {
  if (!ops.quiet) bar.update(progress);
};

function main () {
  // command line options and init
  const ops = stdio.getopt({
    // arguments
    'hostname': {key: 'h', args: 1, description: 'The hostname to use. For local specify: http://127.0.0.1:1111/   Default: https://api.hybrix.io/'},
    'username': {key: 'u', args: 1, description: 'Set username'},
    'password': {key: 'p', args: 1, description: 'Set password'},
    'importKey': {key: 'i', args: 1, description: 'Import private key'},
    'test': {key: 'T', args: 0, description: 'Use test credentials'},
    'local': {key: 'l', args: 0, description: 'Use local host'},
    'noroot': {key: 'n', args: 0, description: 'Use local host with non root port.'},

    // methods
    ...methods,

    // options
    'yes': {key: 'y', args: 0, description: 'Consent to all requests (please know what you\'re doing).'},
    'verbose': {key: 'V', args: 0, description: 'Display verbose output.'},
    'quiet': {key: 'q', args: 0, description: 'No extra output other than raw data'},
    'forceEthNonce': {key: 'FE', args: 1, description: 'Force nonce transaction number for Ethereum [argument: integer]'},
    'novalidate': {key: 'N', args: 0, description: 'Skip validation of target address and available balance before transaction'},
    'offset': {key: 'o', args: 1, description: 'Specify the account offset to use'},
    'debug': {key: 'd', args: 0, description: 'Run in debug mode'},
    _meta_: {minArgs: 0, maxArgs: 0, args: 0}
  });

  if (ops.verbose) {
    console.log('[i] version = ' + require('./methods/version').getVersion());
    console.log('[i] verbose = true');
    console.log('[i] username = ' + ops.username);
    console.log('[i] password = ' + (ops.password ? '***' : undefined));
    console.log('[i] yes = ' + !!ops.yes);
    console.log('[i] test = ' + !!ops.test);
    console.log('[i] local = ' + !!ops.local);
    console.log('[i] quiet = ' + !!ops.quiet);
    console.log('[i] novalidate = ' + !!ops.novalidate);
    console.log('[i] offset = ' + ops.offset);
    console.log('[i] debug = ' + !!ops.debug);
    console.log('[i] forceEthNonce = ' + ops.forceEthNonce);
  }

  let method;
  let methodId;
  for (let id in methods) {
    if (ops[id]) {
      if (method) {
        console.error('\n\n' + '[!] Error: Only one method action allowed!');
        process.exit(1);
      }
      methodId = id;
      method = methods[id];
    }
  }
  if (!method) {
    console.log('\n' + ' hybrix CLI wallet - for help, run: ./cli-wallet --help' + '\n');
    process.exit(0);
  }
  if (ops.verbose) console.log('[i] method = ' + methodId);

  DEBUG = ops.debug;

  const actions = [];

  if (methodId !== 'module') {
    setup.host(ops, method, actions);
    setup.session(ops, method, actions);
  }

  const parameters = (ops[methodId] instanceof Array) ? ops[methodId] : [ops[methodId]];

  // required to catch error when no arugment is passed silently by getOpts
  if (method.args === 1 && parameters.length === 1 && parameters[0] === true) {
    console.log('[!] ' + methodId + ' method expects an argument.');
    process.exit(1);
  }

  if (ops.verbose) console.log('[i] parameters = ' + parameters);

  // use method
  actions.push(...method[methodId](ops)(...parameters));

  // show progress
  makeProgressBar(methodId);

  // take action
  hybrixd.sequential(
    actions,
    dataCallback(ops),
    errorCallback(ops),
    progressCallback(ops)
  );
}
