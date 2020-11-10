exports.key = 'K';
exports.args = 1;
exports.description = 'Get internal keys object from account [argument: symbol]';

exports.keysobject = (ops) => symbol => [{symbol}, 'getKeys'];
