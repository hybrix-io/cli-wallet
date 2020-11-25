exports.key = 'B';
exports.args = 1;
exports.host = 'allocation';
exports.description = 'Get the balance of an allocation account [argument: symbol]';

exports.balance = (ops) => (symbol) => [
  {symbol}, 'getAddress',
  address => { return {query: '/a/' + symbol + '/balance/' + address}; }, 'rout'
];
