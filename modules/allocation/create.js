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
  let securitySymbol;
  amount = typeof amount === 'undefined' ? MINIMAL_DEPOSIT : amount;
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
        {query: '/e/allocation/security-symbol'}, 'rout',
        symbol => { securitySymbol = symbol; return {symbol, available: true}; }, 'getBalance',
        balance => ({condition: Number(balance) >= MINIMAL_DEPOSIT, message: `A minimal available balance of ${MINIMAL_DEPOSIT} ${securitySymbol.toUpperCase()} is required, currently only ${balance} ${securitySymbol.toUpperCase()} is available.`}), 'assert',
        {query: '/e/allocation/account/init/' + data.detail.accountId + '/' + data.detail.secretKey, chan: 'y'}, 'rout',
        () => [getLogin(ops, this), 'session', ...deposit(ops)(securitySymbol, amount)], 'sequential',
        () => `Account ${data.detail.accountId} has been created. An initial deposit of ${amount} ${securitySymbol.toUpperCase()} has been made. Please note that an additional step has to be made to deposit this as a security before swaps can be made.`
      ],
    'sequential'
  ];
};
