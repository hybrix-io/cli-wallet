const {getSignatureSteps} = require('./pairDelete');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Extract an amount of HY from the security reserve to your allocation account [argument: amount]';

exports.securityExtract = (ops) => (amount) => [
  ...getSignatureSteps(ops, this, 'securityReserveAccount', ['extract', amount]),
  ({accountID, signature}) => ({query: '/e/allocation/account/securityReserve/' + accountID + '/extract/' + amount + '/' + signature}), 'rout'
];
