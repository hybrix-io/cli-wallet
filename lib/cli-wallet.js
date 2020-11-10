const DJB2 = require('../common/crypto/hashDJB2.js');

const storage = require('./storage.js');
const Hybrix = require('../interface/hybrix-lib.nodejs.js');
const hybrixd = new Hybrix.Interface({http: require('http'), https: require('https')});
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

// command line options and init
const ops = stdio.getopt({
  'hostname': {key: 'h', args: 1, description: 'The hostname to use. For local specify: http://127.0.0.1:1111/   Default: https://api.hybrix.io/'},
  'API': {key: 'R', args: 1, description: 'Perform an API routing call [argument: API_path]'},
  'userid': {key: 'u', args: 1, description: 'Set username'},
  'passwd': {key: 'p', args: 1, description: 'Set password'},
  'importKey': {key: 'i', args: 1, description: 'Import private key'},
  'create': {key: 'c', description: 'Generate new deterministic account'},
  'address': {key: 'a', args: 1, description: 'Get address of account [argument: symbol]'},
  'balance': {key: 'b', args: 1, description: 'Get the balance of an address [argument: symbol]'},
  'rawtransaction': {key: 'r', args: 3, description: 'Create a raw transaction [argument: symbol] [argument: amount] [argument: target_address]'},
  'sendtransaction': {key: 's', args: 3, description: 'Send transaction [argument: symbol] [argument: amount] [argument: target_address]'},
  'publickey': {key: 'P', args: 1, description: 'Get public key from account [argument: symbol]'},
  'secretkey': {key: 'S', args: 1, description: 'Get private key from account [argument: symbol]'},
  'keysobject': {key: 'K', args: 1, description: 'Get internal keys object from account [argument: symbol]'},
  'quiet': {key: 'q', args: 0, description: 'No extra output other than raw data'},
  'forceEthNonce': {key: 'FE', args: 1, description: 'Force nonce transaction number for Ethereum [argument: integer]'},
  'novalidate': {key: 'n', args: 0, description: 'Skip validation of target address and available balance before transaction'},
  'offset': {key: 'o', args: 1, description: 'Specify the account offset to use'},
  'allocationCreate': {key: 'C', args: 0, description: 'Create new allocation account, returning the ID'},
  'allocationAddress': {key: 'A', args: 1, description: 'Get address of an allocation account [argument: symbol]'},
  'allocationBalance': {key: 'B', args: 1, description: 'Get the balance of an allocation account [argument: symbol]'},
  'allocationDeposit': {key: 'D', args: 2, description: 'Deposit an amount into an allocation account [argument: symbol] [argument: amount]'},
  'allocationWithdraw': {key: 'W', args: 2, description: 'Withdraw an amount from an allocation account [argument: symbol] [argument: amount]'},
  'allocationPairGet': {key: 'M', args: 2, description: 'Get details of an allocation pair [argument: base] [argument: symbol]'},
  'allocationPairSet': {key: 'N', args: 3, description: 'Set or create an allocation pair [argument: base] [argument: symbol] [argument: feePercent] [argument: type] [argument: deadline]'},
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

const exportBlob = (mode, blob, dataCallback, errorCallback) =>
  storage.Set({key: 'deterministic-' + mode, value: blob, local: true},
    () => {
      if (!ops.quiet) console.log('[i] Storing key ' + mode);
      dataCallback();
    },
    errorCallback
  );

const importBlob = (details, dataCallback, errorCallback) => {
  const mode = details.mode.split('.')[0];

  storage.Get({key: 'deterministic-' + mode, local: true},
    blob => {
      if (blob === null) return dataCallback();
      return hybrixd.import(
        {id: mode, blob},
        importResponse => {
          if (importResponse.newerVersionAvailable) exportBlob(mode, blob, dataCallback, errorCallback);
          else dataCallback();
        },
        error => { console.log('[!] Import error!!!'); errorCallback(error); }
      );
    }
  );
};

const actions = [];
if (ops.create) {
  progress.push('create');
  actions.push('createAccount');
} else if (ops.allocationCreate || ops.allocationAddress || ops.allocationBalance || ops.allocationDeposit || ops.allocationWithdraw || ops.allocationPairGet || ops.allocationPairSet || ops.allocationWithdrawSet) {
  // allocation account functionality (start)
  if (ops.allocationAddress || ops.allocationBalance) {
    progress.push(ops.allocationAddress ? 'allocationAddress' : 'allocationBalance');
    actions.push(
      {host: hostnameAllocations}, 'addHost',
      sessionObj, 'session',
      {query: '/a/' + symbol + '/details'}, 'rout',
      {func: importBlob}, 'call',
      {symbol}, 'addAsset',
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
      {query: '/a/' + symbol + '/details'}, 'rout',
      {func: importBlob}, 'call',
      {symbol}, 'addAsset',
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
      {query: '/a/' + symbol + '/details'}, 'rout',
      {func: importBlob}, 'call',
      {symbol}, 'addAsset',
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
    {username: userid, password: passwd}, 'session',
    {host: hostname}, 'addHost',
    {query: '/a/' + symbol + '/details'}, 'rout',
    {func: importBlob}, 'call'
  );
  if (importKey) {
    actions.splice(5, 0, {symbol: symbol, privateKey: importKey}, 'setPrivateKey');
  }
} else {
  actions.push(
    {host: hostname}, 'addHost'
  );
}

if (ops.API) {
  if (ops.API === '/') {
    console.log('\n' + 'Please pass a path to query the API!' + '\n');
    process.exit(1);
  } else {
    progress.push('API');
    actions.push({query: ops.API});
    actions.push('rout');
  }
}

if (ops.balance) {
  progress.push('balance');
  actions.push(
    {symbol}, 'addAsset',
    {symbol}, 'getAddress',
    address => { return {query: '/asset/' + ops.balance + '/balance/' + address}; }, 'rout'
  );
}

if (ops.rawtransaction) {
  progress.push('rawtx');
  const amount = ops.rawtransaction[1];
  const target = ops.rawtransaction[2];
  const tx = {symbol, amount, target, validate: !ops.novalidate};
  if (ops.forceEthNonce) {
    actions.push(
      {query: '/a/eth/unspent/' + target}, 'rout',
      unspent => {
        unspent.nonce = ops.forceEthNonce;
        tx.unspent = unspent;
        return tx;
      }
    );
  } else {
    actions.push(tx);
  }
  actions.push('rawTransaction');
  actions.push(result => { return result.replace(/[*+?^${}()|[[\]\\"']/g, '\\$&'); }); // proper escapes for terminal output
}

if (ops.sendtransaction) {
  progress.push('sendtx');
  const amount = ops.sendtransaction[1];
  const target = ops.sendtransaction[2];
  const tx = {symbol, amount, target};
  if (ops.forceEthNonce) {
    actions.push(
      {query: '/a/eth/unspent/' + target}, 'rout',
      unspent => {
        unspent.nonce = ops.forceEthNonce;
        tx.unspent = unspent;
        return tx;
      }
    );
  } else {
    actions.push(tx);
  }
  actions.push('transaction');
}

if (ops.address) {
  progress.push('address');
  actions.push({symbol: ops.address});
  actions.push('addAsset');
  actions.push({symbol: ops.address});
  actions.push('getAddress');
}

if (ops.publickey) {
  progress.push('publickey');
  actions.push({symbol: ops.publickey});
  actions.push('addAsset');
  actions.push({symbol: ops.publickey});
  actions.push('getPublicKey');
}

if (ops.secretkey) {
  progress.push('secretkey');
  actions.push({symbol: ops.secretkey});
  actions.push('addAsset');
  actions.push({symbol: ops.secretkey});
  actions.push('getPrivateKey');
}

if (ops.keysobject) {
  progress.push('keys');
  actions.push({symbol: ops.keysobject});
  actions.push('addAsset');
  actions.push({symbol: ops.keysobject});
  actions.push('getKeys');
}

// show progress
makeProgressBar(progress.join(','));

// take action
hybrixd.sequential(
  actions,
  (data) => {
    if (!ops.quiet) {
      setTimeout(function () { // timeout to ensure bar is updated to 100% properly
        process.stdout.write(CURSOR_CONTROL_UP); // move cursor up one line (solves progress meter bug)
        bar.update(1);
        console.log('\n' + (typeof data === 'string' || typeof data === 'number' ? data : JSON.stringify(data)) + '\n');
      }, 200);
    } else {
      console.log((typeof data === 'string' || typeof data === 'number' ? data : JSON.stringify(data)));
    }
    // store the deterministic blobs for next time usage
    hybrixd.export({},
      blobs => {
        for (let id in blobs) {
          storage.Set({key: 'deterministic-' + id, value: blobs[id], local: true},
            blob => { if (!ops.quiet) console.log('[i] Storing blob ' + id); },
            error => console.error('[!] Error storing blob ' + id + ': ' + error)
          );
        }
      },
      error => console.error('\n' + '[!] Error storing blobs: ' + error)
    );
  },
  (error) => {
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
