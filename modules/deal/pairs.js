
exports.args = 0;
exports.host = 'allocation';
exports.description = 'Show the available pairs';
exports.requireLogin = false;

exports.pairs = (ops) => () => [
  {query: '/e/allocation/pair/list'}, 'rout'
];
