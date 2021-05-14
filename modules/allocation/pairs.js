const {getSignatureSteps} = require('./pairDelete');

exports.args = 0;
exports.host = 'allocation';
exports.description = 'Show an overview of allocated pairs';

exports.pairs = (ops) => () => [
  ...getSignatureSteps(ops, this, 'detailsAccount', []),
  ({accountID, signature}) => ({query: '/e/allocation/pair/list/' + accountID}), 'rout'
];
