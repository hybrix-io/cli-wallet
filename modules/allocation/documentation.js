const fs = require('fs');

exports.args = 0;
exports.description = 'Display documentation information for this module';
exports.requireLogin = false;

exports.documentation = (ops) => () => {
  return [
    () => fs.readFileSync('./modules/allocation/documentation.md').toString()
  ];
};
