exports.key = 'a';
exports.args = 1;
exports.description = 'Get address of account [argument: symbol]';

exports.test = {
  'dummy': '_dummyaddress_'
};

exports.address = (ops) => symbol => [
  ...(ops.importKey ? [{symbol, privateKey: ops.importKey}, 'setPrivateKey'] : []),
  {symbol}, 'getAddress'
];
