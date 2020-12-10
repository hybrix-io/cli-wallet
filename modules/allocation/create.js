const {getLogin} = require('../../lib/setup');
const fs = require('fs');
const readlineSync = require('readline-sync');

exports.host = 'allocation';
exports.description = 'Create new allocation account, returning the ID';

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

exports.create = (ops) => () => [
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
    ? [() => data.detail.accountId]
    : [{query: '/e/allocation/account/init/' + data.detail.accountId + '/' + data.detail.secretKey}, 'rout'],
  'sequential'
];
