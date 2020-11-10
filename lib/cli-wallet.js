const Hybrix = require('../interface/hybrix-lib.nodejs.js');
const hybrixd = new Hybrix.Interface({http: require('http'), https: require('https'), storage: './storage'});
const ProgressBar = require('progress');
const stdio = require('stdio');

const CURSOR_CONTROL_UP = '\x1B[1A';

const DEFAULT_HOSTNAME = 'https://api.hybrix.io/';
const DEFAULT_HOSTNAME_ALLOCATIONS = 'http://127.0.0.1:1111/'; // TODO!!!

let bar;

function makeProgressBar (title) {
  bar = new ProgressBar(' [.] ' + title + ': [:bar] :percent, eta: :etas', {
    complete: '▓',
    incomplete: '░',
    width: 76 - title.length,
    total: 100
  });
}

const methods = { // TODO load automatically from directory
  'API': require('./methods/api.js'),
  'address': require('./methods/address'),
  'secretkey': require('./methods/secretkey'),
  'publickey': require('./methods/publickey'),
  'balance': require('./methods/balance'),
  'create': require('./methods/create'),
  'rawtransaction': require('./methods/rawtransaction'),
  'sendtransaction': require('./methods/sendtransaction'),
  'keysobject': require('./methods/keysobject')
};

// command line options and init
const ops = stdio.getopt({
  // arguments
  'hostname': {key: 'h', args: 1, description: 'The hostname to use. For local specify: http://127.0.0.1:1111/   Default: https://api.hybrix.io/'},
  'userid': {key: 'u', args: 1, description: 'Set username'},
  'passwd': {key: 'p', args: 1, description: 'Set password'},
  'importKey': {key: 'i', args: 1, description: 'Import private key'},

  // methods
  ...methods,
  // TODO rebuild all to method method
  'allocationCreate': {key: 'C', args: 0, description: 'Create new allocation account, returning the ID'},
  'allocationAddress': {key: 'A', args: 1, description: 'Get address of an allocation account [argument: symbol]'},
  'allocationBalance': {key: 'B', args: 1, description: 'Get the balance of an allocation account [argument: symbol]'},
  'allocationDeposit': {key: 'D', args: 2, description: 'Deposit an amount into an allocation account [argument: symbol] [argument: amount]'},
  'allocationWithdraw': {key: 'W', args: 2, description: 'Withdraw an amount from an allocation account [argument: symbol] [argument: amount]'},
  'allocationPairGet': {key: 'M', args: 2, description: 'Get details of an allocation pair [argument: base] [argument: symbol]'},
  'allocationPairSet': {key: 'N', args: 3, description: 'Set or create an allocation pair [argument: base] [argument: symbol] [argument: feePercent] [argument: type] [argument: deadline]'},
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

DEBUG = ops.debug;

const hostname = ops.hostname || DEFAULT_HOSTNAME;
const hostnameAllocations = ops.hostname || DEFAULT_HOSTNAME_ALLOCATIONS;

const accountOffset = typeof ops.offset !== 'undefined' && !isNaN(ops.offset) ? ops.offset : 100;

let userid;
let passwd;
let importKey;
if (ops.importKey) {
  importKey = ops.importKey;
  userid = 'DUMMYDUMMYDUMMY0';
  passwd = 'DUMMYDUMMYDUMMY0';
} else if (ops.userid && ops.passwd) {
  userid = ops.userid;
  passwd = ops.passwd;
} else {
  if (!ops.create && !ops.API) {
    console.log('\n' + ' hybrix CLI wallet - for help, run: ./cli-wallet --help' + '\n');
    process.exit(0);
  }
}

const symbol = ops.balance ? ops.balance
  : ops.address ? ops.address
    : ops.publickey ? ops.publickey
      : ops.secretkey ? ops.secretkey
        : ops.keysobject ? ops.keysobject
          : typeof ops.rawtransaction !== 'undefined' && ops.rawtransaction[0] ? ops.rawtransaction[0]
            : typeof ops.sendtransaction !== 'undefined' && ops.sendtransaction[0] ? ops.sendtransaction[0]
              : ops.allocationAddress ? ops.allocationAddress
                : ops.allocationBalance ? ops.allocationBalance
                  : typeof ops.allocationDeposit !== 'undefined' && ops.allocationDeposit[0] ? ops.allocationDeposit[0]
                    : typeof ops.allocationWithdraw !== 'undefined' && ops.allocationWithdraw[0] ? ops.allocationWithdraw[0]
                      : null;

const progress = [];

const actions = [];

if (ops.create) {
  // empty
} else if (ops.allocationCreate || ops.allocationAddress || ops.allocationBalance || ops.allocationDeposit || ops.allocationWithdraw || ops.allocationPairGet || ops.allocationPairSet || ops.allocationWithdrawSet) {
  // allocation account functionality (start)
  if (ops.allocationAddress || ops.allocationBalance) {
    progress.push(ops.allocationAddress ? 'allocationAddress' : 'allocationBalance');
    actions.push(
      {host: hostnameAllocations}, 'addHost',
      sessionObj, 'session', // TODO sessionObj is not defined
      {symbol}, 'getAddress'
    );
    if (ops.allocationBalance) {
      actions.push(address => { return {query: '/asset/' + symbol + '/balance/' + address}; }, 'rout');
    }
  } else if (ops.allocationDeposit) {
    progress.push('allocationDeposit');
    const amount = ops.allocationDeposit[1];
    actions.push(
      {host: hostnameAllocations}, 'addHost',
      {username: userid, password: passwd, offset: accountOffset}, 'session',
      {symbol}, 'getAddress',
      target => {
        return [
          {username: userid, password: passwd}, 'session',
          {symbol, amount, target}, 'transaction'
        ];
      }, 'sequential'
    );
  } else if (ops.allocationWithdraw) {
    progress.push('allocationWithdraw');
    const amount = ops.allocationWithdraw[1];
    actions.push(
      {host: hostnameAllocations}, 'addHost',
      {username: userid, password: passwd}, 'session',
      {symbol}, 'getAddress',
      target => {
        return [
          {username: userid, password: passwd, offset: accountOffset}, 'session',
          {symbol, amount, target}, 'transaction'
        ];
      }, 'sequential'
    );
  } else {
    actions.push(
      {host: hostnameAllocations}, 'addHost',
      {username: userid, password: passwd, offset: accountOffset}, 'getLoginKeyPair',
      keys => ({
        sK: {data: keys.secretKey, step: 'id'},
        id: [{data: 'account ' + keys.secretKey}, 'hash', hash => ({data: hash, source: 'hex', target: 'base58'}), 'code']
      }), 'parallel'
    );
    if (ops.allocationCreate) {
      progress.push('allocationCreate');
      actions.push(
        init => ({
          detail: {data: init, step: 'id'},
          exists: [{query: '/e/allocation/account/exists/' + init.id}, 'rout']
        }), 'parallel',
        data => { return data.exists ? [{data: data.detail.id}, 'string'] : [{query: '/e/allocation/account/init/' + data.detail.id + '/' + data.detail.sK}, 'rout']; }, 'sequential'
      );
    } else if (ops.allocationPairGet) {
      const fromBase = ops.allocationPairGet[0];
      const toSymbol = ops.allocationPairGet[1];
      progress.push('allocationPairGet');
      actions.push(
        data => { return [{query: '/e/allocation/pair/get/' + data.id + '/' + fromBase + '/' + toSymbol}, 'rout']; }, 'sequential'
      );
    } else if (ops.allocationPairSet) {
      const fromBase = ops.allocationPairSet[0];
      const toSymbol = ops.allocationPairSet[1];
      const feePercent = ops.allocationPairSet[2];
      const type = typeof ops.allocationPairSet[3] !== 'undefined' ? ops.allocationPairSet[3] : 'autonomous';
      const deadline = typeof ops.allocationPairSet[4] !== 'undefined' ? ops.allocationPairSet[4] : 3600;
      progress.push('allocationPairSet');
      actions.push(
        data => { return [{query: '/e/allocation/pair/set/' + data.id + '/' + fromBase + '/' + toSymbol + '/' + feePercent + '/' + type + '/' + deadline}, 'rout']; }, 'sequential'
      );
    /*
    } else if (ops.allocationWithdrawSet) {
      const toSymbol = ops.allocationWithdrawSet[0];
      const address = ops.allocationWithdrawSet[1];
      progress.push('allocationWithdrawSet');
      actions.push(
        data => { return [{query: '/e/allocation/account/setWithdraw/' + data.id + '/' + toSymbol + '/' + address}, 'rout']; }, 'sequential'
      );
    */
    }
  }
  // allocation account functionality (end)
} else if (userid && passwd) {
  actions.push(
    {username: userid, password: passwd, offset: ops.offset ? Number(ops.offset) : 0}, 'session',
    {host: hostname}, 'addHost'
  );
  if (importKey) {
    actions.splice(5, 0, {symbol: symbol, privateKey: importKey}, 'setPrivateKey'); // TODO do not rely on index 5 being static
  }
} else {
  actions.push({host: hostname}, 'addHost');
}

// use method
for (let id in methods) {
  if (ops[id]) {
    progress.push(id);
    actions.push(...methods[id][id](ops)(ops[id])); // TODO may pass more parameters?
  }
}

// show progress
makeProgressBar(progress.join(','));

// take action
hybrixd.sequential(
  actions,
  data => {
    if (!ops.quiet) {
      setTimeout(function () { // timeout to ensure bar is updated to 100% properly
        process.stdout.write(CURSOR_CONTROL_UP); // move cursor up one line (solves progress meter bug)
        bar.update(1);
        console.log('\n' + (typeof data === 'string' || typeof data === 'number' ? data : JSON.stringify(data)) + '\n');
      }, 200);
    } else {
      console.log((typeof data === 'string' || typeof data === 'number' ? data : JSON.stringify(data)));
    }
  },
  error => {
    try {
      error = JSON.parse(error);
    } catch (e) {}
    const errorMsg = error && error.help
      ? error.help.replace(/<br\/>/g, '\n')
      : error;
    console.error('\n\n' + '[!] Error: ' + JSON.stringify(errorMsg));
    process.exit(1);
  },
  ops.quiet ? undefined : (progress) => { bar.update(progress); }
);
