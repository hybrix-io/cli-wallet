exports.key = 'b';
exports.args = 1;
exports.description = 'Get the balance of an address [argument: symbol]]';

exports.test = {
  'dummy': '10000.00000000'
};

exports.balance = (ops) => symbol => [
  ...(ops.importKey ? [{symbol, privateKey: ops.importKey}, 'setPrivateKey'] : []),
  {symbol}, 'getAddress',
  address => ({query: '/asset/' + symbol + '/balance/' + address}), 'rout'
];
