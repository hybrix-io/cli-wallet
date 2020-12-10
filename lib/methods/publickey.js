exports.key = 'P';
exports.args = 1;
exports.description = 'Get public key from account [argument: symbol]';

exports.publickey = (ops) => symbol => [
  ...(ops.importKey ? [{symbol, privateKey: ops.importKey}, 'setPrivateKey'] : []),
  {symbol}, 'getPublicKey'
];
