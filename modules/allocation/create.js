const {getLogin} = require('../../lib/setup');

exports.host = 'allocation';
exports.description = 'Create new allocation account, returning the ID';

exports.create = (ops) => () => [
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
