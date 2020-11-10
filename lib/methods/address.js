exports.key = 'a';
exports.args = 1;
exports.description = 'Get address of account [argument: symbol]';

exports.address = (ops) => symbol => [{symbol}, 'getAddress'];
