const {getLogin} = require('../../lib/setup');

exports.args = 2;
exports.host = 'allocation';
exports.description = 'Deposit an amount into an allocation account [argument: symbol] [argument: amount]';

exports.deposit = (ops) => (symbol, amount) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({data: 'account ' + keys.secretKey}), 'hash',
  hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
  id => ({query: '/e/allocation/pair/rebalance/' + id + '/' + symbol + '/' + amount}), 'rout',
  {symbol}, 'getAddress', // get allocation address
  target => [ // create a transaction from regular session to allocation session
    getLogin(ops, {...this, host: ''}), 'session',
    {symbol, amount, target}, 'transaction'
  ], 'sequential'
];
