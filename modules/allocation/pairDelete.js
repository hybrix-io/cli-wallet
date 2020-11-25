const {getLogin} = require('../../lib/setup');

exports.key = 'M';
exports.args = 2;
exports.host = 'allocation';
exports.description = 'Delete an allocation pair, making it unavailable [argument: base] [argument: symbol]';

exports.pairDelete = (ops) => (fromBase, toSymbol) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({
    sK: {data: keys.secretKey, step: 'id'},
    id: [{data: 'account ' + keys.secretKey}, 'hash', hash => ({data: hash, source: 'hex', target: 'base58'}), 'code']
  }), 'parallel',
  data => { return [{query: '/e/allocation/pair/delete/' + data.id + '/' + fromBase + '/' + toSymbol}, 'rout']; }, 'sequential'
];
