exports.key = 'S';
exports.args = 1;
exports.description = 'Get private key from account [argument: symbol]';

exports.secretkey = (ops) => symbol => [{symbol}, 'getPrivateKey'];
