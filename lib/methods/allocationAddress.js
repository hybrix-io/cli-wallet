exports.key = 'A';
exports.args = 1;
exports.host = 'allocation';
exports.description = 'Get address of an allocation account [argument: symbol]';

exports.allocationAddress = (ops) => (symbol) => [{symbol}, 'getAddress'];
