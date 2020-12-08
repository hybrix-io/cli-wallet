const {getLogin} = require('../../lib/setup');

exports.args = 0;
exports.host = 'allocation';
exports.description = 'Get the balance of the deposited security reserve';

exports.securityDetails = (ops) => () => [
  getLogin(ops, this), 'getLoginKeyPair',
  keys => ({data: 'account ' + keys.secretKey}), 'hash',
  hash => ({data: hash, source: 'hex', target: 'base58'}), 'code',
  id => ({query: '/e/allocation/account/securityReserve/' + id + '/balance'}), 'rout'
];

