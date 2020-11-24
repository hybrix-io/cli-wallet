const {getLogin} = require('../../lib/setup');

exports.key = 'X';
exports.args = 3;
exports.host = 'allocation';
exports.description = 'Prepare for a deal by requesting a proposal [argument: base] [argument: symbol] [argument: target_amount]';

exports.proposal = (ops) => (base, symbol, targetAmount) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {symbol}, 'getAddress', // get primary allocation address
  target => { return [{query: '/e/deal/proposal/' + base + '/' + symbol + '/' + targetAmount + '/' + target}, 'rout']; }, 'sequential'
];
