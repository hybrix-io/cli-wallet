const fs = require('fs');
const { exec } = require('child_process');

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
        const child = exec('./cli-wallet -q --test --local --' + methodId + ' ' + args);
        child.stdout.on('data', output => {
          output = output.substr(0, output.length - 1); // strip end \n
          if (output === expectedOutput) console.log(`[v] Test ${methodId} ${args} succeeded.`);
          else console.log(`[x] Test --${methodId} ${args} failed. Output '${output}' did not match expectedOutput '${expectedOutput}'`);
        });

        child.stderr.on('data', error => {
          error = error.substr(0, error.length - 1); // strip end \n
          console.log(`[x] Test --${methodId} ${args} failed with error: ` + error);
        });

        child.on('close', code => {
          if (code !== 0) console.log(`[x] Test --${methodId} ${args} failed with error code` + code);
        });
      }
    } else console.log('[!] No tests available for ' + methodId);
  }
}
