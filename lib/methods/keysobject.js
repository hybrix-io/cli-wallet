exports.key = 'K';
exports.args = 1;
exports.description = 'Get internal keys object from account [argument: symbol]';

exports.test = {
  'dummy': '{"public":"_dummypublickey_","private":"_dummyprivatekey_"}'
};

exports.keysobject = (ops) => symbol => [
  ...(ops.importKey ? [{symbol, privateKey: ops.importKey}, 'setPrivateKey'] : []),
  {symbol}, 'getKeys'
];
