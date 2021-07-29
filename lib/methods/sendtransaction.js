exports.key = 's';
exports.args = 3;
exports.description = 'Send transaction [argument: symbol] [argument: amount] [argument: target_address]';

exports.test = {
  'dummy 10 _dummyaddress_': 'TX01'
};

const {getTransactionActions} = require('./rawtransaction');

exports.sendtransaction = (ops) => (symbol, amount, target) => {
  const tx = {symbol, amount, target, validate: !ops.novalidate, addToPending: !ops.nopending};
  const actions = getTransactionActions(ops, tx, symbol, amount, target);
  actions.push('transaction');
  return actions;
};
