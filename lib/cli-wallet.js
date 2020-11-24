const Hybrix = require('../interface/hybrix-lib.nodejs.js');
const hybrixd = new Hybrix.Interface({http: require('http'), https: require('https'), storage: './storage'});
const ProgressBar = require('progress');
const stdio = require('stdio');
const fs = require('fs');
const setup = require('./setup');

const CURSOR_CONTROL_UP = '\x1B[1A';

let bar;

function makeProgressBar (title) {
  bar = new ProgressBar(' [.] ' + title + ': [:bar] :percent, eta: :etas', {
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

const dataCallback = ops => data => {
  if (!ops.quiet) {
    setTimeout(function () { // timeout to ensure bar is updated to 100% properly
      process.stdout.write(CURSOR_CONTROL_UP); // move cursor up one line (solves progress meter bug)
      bar.update(1);
      console.log('\n' + (typeof data === 'string' || typeof data === 'number' ? data : JSON.stringify(data)) + '\n');
    }, 200);
  } else {
    console.log((typeof data === 'string' || typeof data === 'number' ? data : JSON.stringify(data)));
  }
};

const errorCallback = ops => error => {
  try {
    error = JSON.parse(error);
  } catch (e) {}
  const errorMsg = error && error.help
    ? error.help.replace(/<br\/>/g, '\n')
    : error;
  console.error('\n\n' + '[!] Error: ' + JSON.stringify(errorMsg));
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
    'userid': {key: 'u', args: 1, description: 'Set username'},
    'passwd': {key: 'p', args: 1, description: 'Set password'},
    'importKey': {key: 'i', args: 1, description: 'Import private key'},
    'test': {key: 'T', args: 0, description: 'Use test credentials'},

    // methods
    ...methods,

    // options
    'quiet': {key: 'q', args: 0, description: 'No extra output other than raw data'},
    'forceEthNonce': {key: 'FE', args: 1, description: 'Force nonce transaction number for Ethereum [argument: integer]'},
    'novalidate': {key: 'n', args: 0, description: 'Skip validation of target address and available balance before transaction'},
    'offset': {key: 'o', args: 1, description: 'Specify the account offset to use'},
    'debug': {key: 'd', args: 0, description: 'Run in debug mode'}
  });

  /* allocation account options that are currently disabled
   *
   * 'allocationWithdrawSet': {key: 'W', args: 2, description: 'Set the withdrawal address of an account [argument: symbol] [argument: address]'},
   * -> reason: withdrawing should be done client-side as the norm, it is possible for a future use-case to arise that may warrant the node-side withdrawal mechanism
   *
   */
  /*
          } else if (ops.allocationWithdrawSet) {
          const toSymbol = ops.allocationWithdrawSet[0];
          const address = ops.allocationWithdrawSet[1];
          progress.push('allocationWithdrawSet');
          actions.push(
          data => { return [{query: '/e/allocation/account/setWithdraw/' + data.id + '/' + toSymbol + '/' + address}, 'rout']; }, 'sequential'
          );
        */

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

  DEBUG = ops.debug;

  const actions = [];

  if (!ops.module) {
    setup.host(ops, method, actions);
    setup.session(ops, method, actions);
  }

  const parameters = (ops[methodId] instanceof Array) ? ops[methodId] : [ops[methodId]];
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
