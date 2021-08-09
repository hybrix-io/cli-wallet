const {getSignatureSteps} = require('./pairDelete');

exports.args = 0;
exports.host = 'allocation';
exports.description = 'Get the details of the security reserve';

exports.details = (ops) => () => [
  ...getSignatureSteps(ops, this, 'detailsAccount', []),
  ({accountID, signature}) => ({query: '/e/swap/allocation/account/details/' + accountID + '/' + signature}), 'rout'
];
