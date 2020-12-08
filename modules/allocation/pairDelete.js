const {getLogin} = require('../../lib/setup');

exports.args = 2;
exports.host = 'allocation';
exports.description = 'Delete an allocation pair, making it unavailable [argument: base] [argument: symbol]';

exports.pairDelete = (ops) => (fromBase, toSymbol) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({data: 'account ' + keys.secretKey}), 'hash',
  hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
  accountId => ({query: '/e/allocation/pair/delete/' + accountId + '/' + fromBase + '/' + toSymbol}), 'rout'
];
