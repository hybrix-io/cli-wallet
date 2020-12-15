const {getLogin} = require('../../lib/setup');
const {MINIMAL_DEPOSIT} = require('./create');
exports.args = 3;
exports.host = 'allocation';
exports.description = 'Set or create an allocation pair [argument: base] [argument: symbol] [argument: feePercent] [argument: type] [argument: deadline]';

exports.pairSet = (ops) => (fromBase, toSymbol, feePercent, type, deadline) => {
  let accountId;
  return [

    getLogin(ops, this), 'getLoginKeyPair',
    keys => ({data: 'account ' + keys.secretKey}), 'hash',
    hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
    id => {
      accountId = id;
      return {query: '/e/allocation/account/securityReserve/' + id + '/details'};
    }, 'rout',
    details => ({condition: details.balace >= MINIMAL_DEPOSIT, message: `A minimal available balance of ${MINIMAL_DEPOSIT} ${details.symbol.toUpperCase()} is required, currently only ${details.balance} ${details.symbol.toUpperCase()} is available.`}), 'assert',
    () => ({query: '/e/allocation/pair/set/' + accountId + '/' + fromBase + '/' + toSymbol + '/' + feePercent + '/' + type + '/' + deadline}), 'rout'
  ];
};
