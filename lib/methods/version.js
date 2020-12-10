const {readFileSync} = require('fs');
exports.key = 'v';
exports.args = 0;
exports.description = 'Retrieve the version';
exports.host = 'none';
exports.requireLogin = false;

const getVersion = () => {
  let version;
  try {
    version = JSON.parse(readFileSync('./package.json').toString()).version;
  } catch (e) {
    return 'Failed to retrieve version';
  }
  return version;
};
exports.getVersion = getVersion;
exports.version = (ops) => query => [getVersion];
