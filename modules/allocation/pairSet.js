const {getSignatureSteps} = require('./pairDelete');

const {MINIMAL_DEPOSIT} = require('./create');
exports.args = 3;
exports.host = 'allocation';
exports.description = 'Set or create an allocation pair [argument: base] [argument: symbol] [argument: feePercent]';

exports.pairSet = (ops) => (fromBase, toSymbol, feePercent, type, deadline) => [
  ...getSignatureSteps(ops, this, 'securityReserveAccount', ['details']),
  ({accountID, signature}) => ({query: '/e/allocation/account/securityReserve/' + accountID + '/details/' + signature}), 'rout',

  details => ({condition: details.balance >= MINIMAL_DEPOSIT, message: `A minimal security deposit of ${MINIMAL_DEPOSIT} ${details.symbol.toUpperCase()} is required to setup this pair, currently only ${details.balance} ${details.symbol.toUpperCase()} is available.`}), 'assert',

  ...getSignatureSteps(ops, this, 'setPair', [fromBase, toSymbol, feePercent, type]),
  ({accountID, signature}) => ({query: '/e/allocation/pair/set/' + accountID + '/' + fromBase + '/' + toSymbol + '/' + feePercent + '/' + type + '/' + signature}), 'rout'
];
