exports.args = 1;
exports.host = 'allocation';
exports.description = 'Check the status of a deal [argument: dealID]';
exports.requireLogin = false;

exports.status = (ops) => (dealID) => [
  {query: '/e/swap/deal/status/' + dealID}, 'rout'
];
