const {getLogin} = require('../../lib/setup');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Sequestrate an amount of TOMO.HY from your allocation account to the security reserve [argument: amount]';

exports.securityDeposit = (ops) => (amount) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({data: 'account ' + keys.secretKey}), 'hash',
  hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
  id => ({query: '/e/allocation/account/securityReserve/' + id + '/deposit/' + amount}), 'rout'
];
