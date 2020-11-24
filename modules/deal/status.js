const {getLogin} = require('../../lib/setup');

exports.key = 'Z';
exports.args = 1;
exports.host = 'allocation';
exports.description = 'Check the status of a deal [argument: dealID]';

exports.status = (ops) => (dealID) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {query: '/e/deal/status/' + dealID}, 'rout'
];
