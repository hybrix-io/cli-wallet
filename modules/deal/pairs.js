const {getLogin} = require('../../lib/setup');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Show the available pairs';

exports.status = (ops) => (dealID) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {query: '/e/deal/pairs'}, 'rout'
];
