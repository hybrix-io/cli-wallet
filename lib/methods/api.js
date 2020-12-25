exports.key = 'R';
exports.args = 1;
exports.description = 'Perform an API routing call [argument: API_path]';
exports.requireLogin = false;
exports.test = {
  '--api /a/dummy/balance/_dummyaddress_ --test -q': '10000.00000000'
};
exports.api = (ops) => query => [{query}, 'rout'];
