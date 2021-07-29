const {getLogin} = require('../../lib/setup');
const {getSignatureSteps} = require('./pairDelete');

exports.host = 'allocation';
exports.args = 2;
exports.description = 'Withdraw an amount from an allocation account [argument: symbol] [argument: amount]';

exports.withdraw = (ops) => (symbol, amount) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {symbol}, 'getAddress', // get regular address
  target => [
    ...getSignatureSteps(ops, this, 'rebalancePair', [symbol, '-' + String(amount)]),
    ({accountID, signature}) => ({query: '/e/allocation/pair/rebalance/' + accountID + '/' + symbol + '/-' + amount + '/' + signature}), 'rout',
    getLogin(ops, this), 'session', // initialize with allocation session
    {symbol, amount, target}, 'transaction'
  ], 'sequential'
];
