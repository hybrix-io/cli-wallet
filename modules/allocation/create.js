const {getLogin} = require('../../lib/setup');
const {deposit} = require('./deposit');
const fs = require('fs');
const readlineSync = require('readline-sync');
const MINIMAL_DEPOSIT = 10;
exports.MINIMAL_DEPOSIT = MINIMAL_DEPOSIT;
exports.host = 'allocation';
exports.description = 'Create new allocation account, returning the ID. [optional argument: initial deposit amount]';

const checkEULA = ops => () => {
  let answer;
  if (fs.existsSync('./modules/allocation/.EULA.consent')) {
    answer = 'y';
    if (ops.verbose) console.log('[i] EULA has been previously agreed to.');
  } else if (ops.yes) {
    answer = 'y';
    if (ops.verbose) console.log('[i] Automatically consented to EULA.');
  } else {
    console.log(fs.readFileSync('./modules/allocation/EULA.md').toString());
    while (answer !== 'y' && answer !== 'n') {
      answer = readlineSync.question('Do you agree [y/n]: ');
    }
  }
  if (answer === 'y') { // write consent to file
    if (ops.verbose) console.log('[i] Consented to EULA.');
    fs.writeFileSync('./modules/allocation/.EULA.consent', (new Date()).toString());
  }
  return {condition: answer === 'y', message: 'Could not continue without EULA approval.'};
};
exports.create = (ops) => (amount) => {
  let securitySymbol, SYMBOL;
  let availableMainBalance;
  let availableAllocationBalance;
  if (typeof amount === 'undefined') amount = MINIMAL_DEPOSIT;
  if (isNaN(amount)) {
    return [{condition: false, message: `Expected numerical deposit, got '${amount}'`}, 'assert'];
  }

  return [
    checkEULA(ops), 'assert',
    getLogin(ops, this), 'getLoginKeyPair',
    keys => ({
      secretKey: {data: keys.secretKey, step: 'id'},
      accountId: [{data: 'account ' + keys.secretKey}, 'hash', hash => ({data: hash, source: 'hex', target: 'base58'}), 'code']
    }), 'parallel',
    init => ({
      detail: {data: init, step: 'id'},
      exists: [{query: '/e/allocation/account/exists/' + init.accountId}, 'rout']
    }), 'parallel',
    data => data.exists
      ? [() => 'Account ' + data.detail.accountId + ' has already been initialized.']
      : [
        getLogin(ops, {...this, host: ''}), 'session',

        // Retrieve the security symbol
        {query: '/e/allocation/security-symbol'}, 'rout',

        // Retrieve available balances
        symbol => {
          securitySymbol = symbol;
          SYMBOL = securitySymbol.toUpperCase();
          return {symbol};
        }, 'getBalance',
        balance => {
          availableMainBalance = Number(balance);
        },

        getLogin(ops, this), 'session',
        () => ({symbol: securitySymbol}), 'getBalance',
        balance => {
          availableAllocationBalance = Number(balance);
        },

        // Check balances
        () => ({
          condition: availableMainBalance + availableAllocationBalance >= MINIMAL_DEPOSIT,
          message: `A minimal available balance of ${MINIMAL_DEPOSIT} ${SYMBOL} is required,
currently only ${availableMainBalance + availableAllocationBalance} ${SYMBOL} is available.
(Main balance is ${availableMainBalance} ${SYMBOL}, allocation balance is ${availableAllocationBalance} ${SYMBOL}) `
        }), 'assert',

        {query: '/e/allocation/account/init/' + data.detail.accountId + '/' + data.detail.secretKey, chan: 'y'}, 'rout',

        // Regiser existing balance
        // ({accountID, signature}) => ({query: '/e/allocation/pair/rebalance/' + accountID + '/' + symbol + '/' + amount + '/' + signature}), 'rout',

        // Finalize
        () => `Account ${data.detail.accountId} has been created.
The main balance is       ${availableMainBalance} ${SYMBOL}.
The allocation balance is ${availableAllocationBalance} ${SYMBOL}.
Please note that an additional step has to be made to deposit a minimum of ${MINIMAL_DEPOSIT} ${SYMBOL} as a security before swaps can be made.`
      ],
    'sequential'
  ];
};
