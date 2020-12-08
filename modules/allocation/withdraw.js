const {getLogin} = require('../../lib/setup');

exports.host = 'allocation';
exports.args = 2;
exports.description = 'Withdraw an amount from an allocation account [argument: symbol] [argument: amount]';

exports.withdraw = (ops) => (symbol, amount) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {symbol}, 'getAddress', // get regular address
  target => [
    getLogin(ops, this), 'getLoginKeyPair', // initialize with allocation session
    keys => ({data: 'account ' + keys.secretKey}), 'hash',
    hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
    accountId => ({query: '/e/allocation/pair/rebalance/' + accountId + '/' + symbol + '/-' + amount}), 'rout',
    getLogin(ops, this), 'session', // initialize with allocation session
    {symbol, amount, target}, 'transaction'
  ], 'sequential'
];
