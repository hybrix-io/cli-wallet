const fs = require('fs');

exports.args = 0;
exports.host = 'allocation';
exports.description = 'Display help information for this module';

exports.help = (ops) => () => {
  return [
    () => fs.readFileSync('./modules/allocation/help.md').toString()
  ];
};
