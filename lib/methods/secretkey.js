exports.key = 'S';
exports.args = 1;
exports.description = 'Get private key from account [argument: symbol]';

exports.test = {
  'dummy': '_dummyprivatekey_'
};

exports.secretkey = (ops) => symbol => [
  ...(ops.importKey ? [{symbol, privateKey: ops.importKey}, 'setPrivateKey'] : []),
  {symbol}, 'getPrivateKey'
];
