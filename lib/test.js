const fs = require('fs');
const {cliWallet} = require('./child.js');

const methods = {};
// Loop through all the files in the methods directory
fs.readdir('./lib/methods', function (err, files) {
  if (err) {
    console.error('[!] Could not list the methods directory.', err);
    process.exit(1);
  }
  files.forEach(function (file, index) {
    if (file.endsWith('.js')) {
      const id = file.split('.')[0];
      methods[id] = require('./methods/' + id);
    }
  });
  test();
});

function test () {
  for (let methodId in methods) {
    const method = methods[methodId];
    if (method.hasOwnProperty('test')) {
      console.log('[i] Executing tests for ' + methodId);
      for (let args in method.test) {
        const expectedOutput = method.test[args];
        cliWallet('--' + methodId + ' ' + args,
          output => {
            if (output === expectedOutput) console.log(`[v] Test ${methodId} ${args} succeeded.`);
            else console.log(`[x] Test --${methodId} ${args} failed. Output '${output}' did not match expectedOutput '${expectedOutput}'`);
          },
          error => console.log(`[x] Test --${methodId} ${args} failed with error` + error)
        );
      }
    } else console.log('[!] No tests available for ' + methodId);
  }
}
