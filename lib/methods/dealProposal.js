const {getLogin} = require('../setup');

exports.key = 'X';
exports.args = 3;
exports.host = 'allocation';
exports.description = 'Prepare for a deal by requesting a proposal [argument: base] [argument: symbol] [argument: target_amount]';

exports.dealProposal = (ops) => ([base, symbol, target_amount]) => [
  {username: ops.userid, password: ops.passwd}, 'session',
  {symbol}, 'getAddress', // get primary allocation address
  target => { return [{query: '/e/deal/proposal/' + base + '/' + symbol + '/' + target_amount + '/' + target}, 'rout']; }, 'sequential'
];
