const {getLogin} = require('../../lib/setup');

exports.key = 'W';
exports.host = 'allocation';
exports.args = 2;
exports.description = 'Withdraw an amount from an allocation account [argument: symbol] [argument: amount]';

exports.withdraw = (ops) => (symbol, amount) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {symbol}, 'getAddress', // get regular address
  target => [
    getLogin(ops, this), 'session', // initialize with allocation session
    getLogin(ops, this), 'getLoginKeyPair',
    keys => ([{data: 'account ' + keys.secretKey}, 'hash', hash => ({data: hash, source: 'hex', target: 'base58'}), 'code']), 'sequential',
    id => ([{query: '/e/allocation/pair/rebalance/' + id + '/' + symbol + '/-' + amount}, 'rout']), 'sequential',
    {symbol, amount, target}, 'transaction'
  ], 'sequential'
];
