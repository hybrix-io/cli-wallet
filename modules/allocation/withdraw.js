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
    {symbol, amount, target}, 'transaction'
  ], 'sequential'
];
