exports.key = 'c';
exports.description = 'Generate new deterministic account';
exports.host = 'none';
exports.test = {};
exports.requireLogin = false;
exports.create = (ops) => () => ['createAccount'];
