const {getLogin} = require('../../lib/setup');
const {getSignatureSteps} = require('./pairDelete');

exports.host = 'allocation';
exports.args = 3;
exports.description = 'Transfer an amount from an allocation account [argument: symbol] [argument: amount] [argument: target]';

exports.transfer = (ops) => (symbol, amount, target) => [
  ...getSignatureSteps(ops, this, 'rebalancePair', [symbol, '-' + String(amount)]),
  ({accountID, signature}) => ({query: '/e/allocation/pair/rebalance/' + accountID + '/' + symbol + '/-' + amount + '/' + signature}), 'rout',
  getLogin(ops, this), 'session', // initialize with allocation session
  {symbol, amount, target}, 'transaction'
];
