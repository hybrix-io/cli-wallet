const { exec } = require('child_process');

function cliWallet (args, dataCallback, errorCallback) {
  const child = exec('./cli-wallet -q --test --local ' + args);

  let cout = '';
  let cerr = '';
  child.stdout.on('data', data => {
    cout += data.substr(0, data.length - 1); // strip end \n
  });

  child.stderr.on('data', error => {
    cerr += error.substr(0, error.length - 1); // strip end \n
  });

  child.on('close', code => {
    if (code === 0) dataCallback(cout);
    else errorCallback(cerr);
  });
}
exports.cliWallet = cliWallet;
