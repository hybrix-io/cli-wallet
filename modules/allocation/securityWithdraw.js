const {getSignatureSteps} = require('./pairDelete');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Extract an amount of TOMO.HY from the security reserve to your allocation account [argument: amount]';

exports.securityWithdraw = (ops) => (amount) => [
  ...getSignatureSteps(ops, this, 'securityReserveAccount', ['withdraw', amount]),
  ({accountID, signature}) => ({query: '/e/allocation/account/securityReserve/' + accountID + '/withdraw/' + amount + '/' + signature}), 'rout'
];
