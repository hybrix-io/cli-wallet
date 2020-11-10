const setup = require('../setup');

exports.key = 'W';
exports.host = 'allocation';
exports.args = 2;
exports.description = 'Withdraw an amount from an allocation account [argument: symbol] [argument: amount]';

exports.allocationWithdraw = (ops) => ([symbol, amount]) => [
  {username: ops.userid, password: ops.passwd}, 'session',
  {symbol}, 'getAddress', // get regular address
  target => {
    const actions = [];
    setup.session(ops, this, actions); // initialize with allocation session
    actions.push({symbol, amount, target}, 'transaction');
    return actions;
  }, 'sequential'
];
