exports.args = 3;
exports.host = 'allocation';
exports.description = 'Prepare for a deal by requesting an estimate [argument: base] [argument: symbol] [argument: target_amount]';
exports.requireLogin = false;

exports.estimate = (ops) => (base, symbol, targetAmount) => [
  {query: '/e/swap/deal/estimate/' + base + '/' + symbol + '/' + targetAmount }, 'rout'
];
