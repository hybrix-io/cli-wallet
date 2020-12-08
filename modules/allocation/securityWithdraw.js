const {getLogin} = require('../../lib/setup');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Extract an amount of TOMO.HY from the security reserve to your allocation account [argument: amount]';

exports.securityWithdraw = (ops) => (amount) => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({data: 'account ' + keys.secretKey}), 'hash',
  hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
  id => ({query: '/e/allocation/account/securityReserve/' + id + '/withdraw/' + amount}), 'rout'
];

