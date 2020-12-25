const {getSignatureSteps} = require('./pairDelete');

exports.args = 0;
exports.host = 'allocation';
exports.description = 'Get the details of the security reserve';

exports.securityDetails = (ops) => () => [
  ...getSignatureSteps(ops, this, 'securityReserveAccount', ['details']),
  ({accountID, signature}) => ({query: '/e/allocation/account/securityReserve/' + accountID + '/details/' + signature}), 'rout'
];
