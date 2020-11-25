const {getLogin} = require('../../lib/setup');

exports.key = 'N';
exports.args = 3;
exports.host = 'allocation';
exports.description = 'Set or create an allocation pair [argument: base] [argument: symbol] [argument: feePercent] [argument: type] [argument: deadline]';

exports.pairSet = (ops) => (fromBase, toSymbol, feePercent, type, deadline) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({data: 'account ' + keys.secretKey}), 'hash',
  hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
  accountId => ({query: '/e/allocation/pair/set/' + accountId + '/' + fromBase + '/' + toSymbol + '/' + feePercent + '/' + type + '/' + deadline}), 'rout'
];
