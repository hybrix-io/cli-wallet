const {getLogin} = require('../../lib/setup');
const {getSignatureSteps} = require('./pairDelete');

exports.args = 2;
exports.host = 'allocation';
exports.description = 'Deposit an amount into an allocation account [argument: symbol] [argument: amount]';

exports.deposit = (ops) => (symbol, amount) => [
  ...getSignatureSteps(ops, this, 'rebalancePair', [symbol, String(amount)]),
  ({accountID, signature}) => ({query: '/e/swap/allocation/pair/rebalance/' + accountID + '/' + symbol + '/' + amount + '/' + signature}), 'rout',
  {symbol}, 'getAddress', // get allocation address
  target => [ // create a transaction from regular session to allocation session
    getLogin(ops, {...this, host: ''}), 'session',
    {symbol, amount, target}, 'transaction'
  ], 'sequential'
];
