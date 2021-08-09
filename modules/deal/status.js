const {getLogin} = require('../../lib/setup');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Check the status of a deal [argument: dealID]';

exports.status = (ops) => (dealID) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {query: '/e/swap/deal/status/' + dealID}, 'rout'
];
