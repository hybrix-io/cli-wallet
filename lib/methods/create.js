exports.key = 'c';
exports.description = 'Generate new deterministic account';
exports.host = 'none';
exports.requireLogin = false;
exports.create = (ops) => () => ['createAccount'];
