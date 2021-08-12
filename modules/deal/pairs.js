
exports.args = 0;
exports.host = 'allocation';
exports.description = 'Show pairs available for swapping';
exports.requireLogin = false;

exports.pairs = (ops) => () => [
  {query: '/e/swap/deal/pairs'}, 'rout'
];
