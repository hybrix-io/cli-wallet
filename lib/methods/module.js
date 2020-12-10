const setup = require('../setup');
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

function execute (ops, id, methodId, parameters) {
  if (pathExists('./modules/' + id, true)) {
    if (pathExists('./modules/' + id + '/' + methodId + '.js')) {
      let method;
      try {
        method = require('../../modules/' + id + '/' + methodId + '.js');
      } catch (error) {
        return fail('Failed to load module method ' + id + ':' + methodId + ' ' + error);
      }
      if (typeof method === 'object' && method !== null && method.hasOwnProperty(methodId) && typeof method[methodId] === 'function') {
        let actions = [];
        setup.host(ops, method, actions);
        setup.session(ops, method, actions);

        try {
          actions.push(...method[methodId](ops)(...parameters));
        } catch (error) {
          return fail('Failed to exectue module method ' + id + ':' + methodId + '. ' + error);
        }

        return actions;
      } else return fail('Failed to load module method ' + id + ':' + methodId);
    } else return fail('Module method ' + id + ':' + methodId + ' does not exist.');
  } else return fail('Module ' + id + ' does not exist.');
}

function padd (x, n) {
  return x.length < n ? x + ' '.repeat(n - x.length) : x;
}

function help (id) {
  if (typeof id === 'undefined') {
    const paths = fs.readdirSync('./modules/');
    let r = 'USAGE: ./cli-wallet --module [MODULE] [METHOD] arg1 arg2...\nThe following modules are supported:\n';
    for (let path of paths) {
      if (pathExists('./modules/' + path, true)) r += '  ' + padd(path, 40) + '  See --module help ' + path + ' for details.\n';
    }
    r = r.substr(0, r.length - 1);// strip last \n
    return [() => r];
  } else if (pathExists('./modules/' + id, true)) {
    const methods = [];
    const paths = fs.readdirSync('./modules/' + id);
    for (let path of paths) {
      if (path.endsWith('.js') && pathExists('./modules/' + id + '/' + path)) {
        let method;
        try {
          method = require('../../modules/' + id + '/' + path);
        } catch (error) {
          console.error('[!] Failed to load module method ' + path + ' ' + error);
        }
        if (typeof method === 'object' && method !== null) {
          const methodId = path.split('.')[0];
          let command = `  -M ${id} ${methodId}`;
          for (let i = 0; i < method.args; ++i) command += ' <ARG' + (i + 1) + '>';
          methods.push([command, method.description]);
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
exports.test = {};
exports.module = (ops) => function (id, methodId, ...parameters) {
  if (id === 'help') return help(methodId);
  else return execute(ops, id, methodId, parameters);
};
