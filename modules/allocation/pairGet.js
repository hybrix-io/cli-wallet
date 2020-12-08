const {getLogin} = require('../../lib/setup');

exports.args = 2;
exports.host = 'allocation';
exports.description = 'Get details of an allocation pair [argument: base] [argument: symbol]';

exports.pairGet = (ops) => (fromBase, toSymbol) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({data: 'account ' + keys.secretKey}), 'hash',
  hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
  accountId => ({query: '/e/allocation/pair/get/' + accountId + '/' + fromBase + '/' + toSymbol}), 'rout'
];
