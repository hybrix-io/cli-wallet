const {getSignatureSteps} = require('./pairDelete');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Sequestrate an amount of TOMO.HY from your allocation account to the security reserve [argument: amount]';

exports.securityDeposit = (ops) => (amount) => [
  ...getSignatureSteps(ops, this, 'securityReserveAccount', ['deposit', amount]),
  ({accountID, signature}) => ({query: '/e/allocation/account/securityReserve/' + accountID + '/deposit/' + amount + '/' + signature}), 'rout'
];
