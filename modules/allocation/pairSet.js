const {getLogin} = require('../../lib/setup');

exports.key = 'N';
exports.args = 3;
exports.host = 'allocation';
exports.description = 'Set or create an allocation pair [argument: base] [argument: symbol] [argument: feePercent] [argument: type] [argument: deadline]';

exports.pairSet = (ops) => (fromBase, toSymbol, feePercent, type, deadline) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({
    sK: {data: keys.secretKey, step: 'id'},
    id: [{data: 'account ' + keys.secretKey}, 'hash', hash => ({data: hash, source: 'hex', target: 'base58'}), 'code']
  }), 'parallel',
  data => { return [{query: '/e/allocation/pair/set/' + data.id + '/' + fromBase + '/' + toSymbol + '/' + feePercent + '/' + type + '/' + deadline}, 'rout']; }, 'sequential'
];
