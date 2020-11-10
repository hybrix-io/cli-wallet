exports.key = 'b';
exports.args = 1;
exports.description = 'Get the balance of an address [argument: symbol]]';

exports.balance = (ops) => symbol => [
  ...(ops.importKey ? [{symbol, privateKey: ops.importKey}, 'setPrivateKey'] : []),
  {symbol}, 'getAddress',
  address => ({query: '/asset/' + symbol + '/balance/' + address}), 'rout'
];
