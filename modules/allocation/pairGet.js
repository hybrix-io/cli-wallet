const {getSignatureSteps} = require('./pairDelete');

exports.args = 2;
exports.host = 'allocation';
exports.description = 'Get details of an allocation pair [argument: base] [argument: symbol]';

exports.pairGet = (ops) => (fromBase, toSymbol) => [
  ...getSignatureSteps(ops, this, 'getPair', [fromBase, toSymbol]),
  ({accountID, signature}) => ({query: '/e/allocation/pair/get/' + accountID + '/' + fromBase + '/' + toSymbol + '/' + signature}), 'rout'
];
