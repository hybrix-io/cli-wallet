const {getSignatureSteps} = require('./pairDelete');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Sequestrate an amount of HY from your allocation account to the security reserve [argument: amount]';

exports.securityReserve = (ops) => (amount) => [
  ...getSignatureSteps(ops, this, 'securityReserveAccount', ['reserve', String(amount)]),
  ({accountID, signature}) => ({query: '/e/allocation/account/securityReserve/' + accountID + '/reserve/' + amount + '/' + signature}), 'rout'
];
