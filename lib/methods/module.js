
const fs = require('fs');

function pathExists (path, dir = false) {
  if (!fs.existsSync(path)) return false;
  const stats = fs.lstatSync(path);
  return dir
    ? stats.isDirectory()
    : stats.isFile();
}

function fail (message) {
  return [{condition: false, message}, 'assert'];
}

function execute (ops, id, method, parameters) {
  if (pathExists('./modules/' + id, true)) {
    if (pathExists('./modules/' + id + '/' + method + '.js')) {
      let file;
      try {
        file = require('../../modules/' + id + '/' + method + '.js');
      } catch (error) {
        return fail('Failed to load module method ' + id + ':' + method + ' ' + error);
      }
      if (typeof file === 'object' && file !== null && file.hasOwnProperty(method) && typeof file[method] === 'function') {
        let result;
        try {
          result = file[method](ops)(...parameters);
        } catch (error) {
          return fail('Failed to exectue module method ' + id + ':' + method + '. ' + error);
        }
        return result;
      } else return fail('Failed to load module method ' + id + ':' + method);
    } else return fail('Module method ' + id + ':' + method + ' does not exist.');
  } else return fail('Module ' + id + ' does not exist.');
}

function help (id) {
  if (pathExists('./modules/' + id, true)) {
    const methods = [];
    const paths = fs.readdirSync('./modules/' + id);
    for (let path of paths) {
      if (path.endsWith('.js') && pathExists('./modules/' + id + '/' + path)) {
        let file;
        try {
          // process.chdir('../../modules/' + id);
          file = require('../../modules/' + id + '/' + path);
        } catch (error) {
          console.error('[!] Failed to load module method ' + path + ' ' + error);
        }
        if (typeof file === 'object' && file !== null) {
          const method = path.split('.')[0];
          let command = `  -M ${id} ${method}`;
          for (let i = 0; i < file.args; ++i) command += ' <ARG' + (i + 1) + '>';
          methods.push([command, file.description]);
        }
      }
    }
    let maxLength = 0;
    for (let i = 0; i < methods.length; ++i) {
      if (methods[i][0].length > maxLength) maxLength = methods[i][0].length;
    }
    // padd the first column
    return [() => methods.map(x => {
      x[0] += ' '.repeat(maxLength - x[0].length);
      return x.join(' ');
    }).join('\n')];
  } else return fail('Module ' + id + ' does not exist.');
}
exports.key = 'M';
exports.args = '*';
exports.description = 'Execute a module function use -M help moduleName to see specific help.';

exports.module = (ops) => function (id, method, ...parameters) {
  if (id === 'help') return help(method);
  else return execute(ops, id, method, parameters);
};
