
exports.args = 0;
exports.host = 'allocation';
exports.description = 'Show an overview of allocated pairs';
exports.requireLogin = false;

exports.pairs = (ops) => () => [
  {query: '/e/allocation/pair/list'}, 'rout'
];
