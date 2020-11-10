const {getLogin} = require('../setup');

exports.key = 'M';
exports.args = 2;
exports.host = 'allocation';
exports.description = 'Get details of an allocation pair [argument: base] [argument: symbol]';

exports.allocationPairGet = (ops) => ([fromBase, toSymbol]) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({
    sK: {data: keys.secretKey, step: 'id'},
    id: [{data: 'account ' + keys.secretKey}, 'hash', hash => ({data: hash, source: 'hex', target: 'base58'}), 'code']
  }), 'parallel',
  data => { return [{query: '/e/allocation/pair/get/' + data.id + '/' + fromBase + '/' + toSymbol}, 'rout']; }, 'sequential'
];
