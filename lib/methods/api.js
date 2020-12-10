exports.key = 'R';
exports.args = 1;
exports.description = 'Perform an API routing call [argument: API_path]';
exports.requireLogin = false;

exports.api = (ops) => query => [{query}, 'rout'];
