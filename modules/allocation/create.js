const {getLogin} = require('../../lib/setup');
exports.key = 'C';
exports.host = 'allocation';
exports.description = 'Create new allocation account, returning the ID';

exports.create = (ops) => () => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({
    sK: {data: keys.secretKey, step: 'id'},
    id: [{data: 'account ' + keys.secretKey}, 'hash', hash => ({data: hash, source: 'hex', target: 'base58'}), 'code']
  }), 'parallel',
  init => ({
    detail: {data: init, step: 'id'},
    exists: [{query: '/e/allocation/account/exists/' + init.id}, 'rout']
  }), 'parallel',
  data => { return data.exists ? [{data: data.detail.id}, 'string'] : [{query: '/e/allocation/account/init/' + data.detail.id + '/' + data.detail.sK}, 'rout']; }, 'sequential'
];
