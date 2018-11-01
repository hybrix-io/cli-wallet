nacl_factory = require('../common/crypto/nacl.js');

//var Hybridd = require('../dist/hybridd.interface.nodejs.js');
var Hybridd = require('./interface.js');
var hybridd = new Hybridd.Interface({http: require('http')});
var ProgressBar = require('progress');
var stdio = require('stdio');

function makeProgressBar(title) {
  bar = new ProgressBar(' [.] '+title+': [:bar] :percent, eta: :etas', {
    complete: '▓',
    incomplete: '░',
    width: 76-title.length,
    total: 100
  });  
}

//var hostname = 'http://wallet-uat.internetofcoins.org/api/';
var hostname = 'http://127.0.0.1:1111/';

// command line options and init
var ops = stdio.getopt({
  'userid': {key: 'u', args: 1, description: 'Set username'},
  'passwd': {key: 'p', args: 1, description: 'Set password'},
  'new': {key: 'n', description: 'Generate new wallet'},
  'address': {key: 'a', args: 1, description: 'Get address of wallet [argument: symbol]'},
  'balance': {key: 'b', args: 1, description: 'Get the balance of an address [argument: symbol]'},
  'rawtransaction': {key: 'r', args: 3, description: 'Create a raw transaction [argument: symbol] [argument: amount] [argument: target_address]'},
  'sendtransaction': {key: 't', args: 3, description: 'Send transaction [argument: symbol] [argument: amount] [argument: target_address]'},
  'publickey': {key: 'P', args: 1, description: 'Get public key from wallet [argument: symbol]'},
  'secretkey': {key: 'S', args: 1, description: 'Get private key from wallet [argument: symbol]'},
  'keysobject': {key: 'K', args: 1, description: 'Get internal keys object from wallet [argument: symbol]'},
  //'string': {key: 'e', args: 0, description: 'Make escaped string output for rawtransaction'},
  'quiet': {key: 'q', args: 0, description: 'No extra output other than raw data'}
  //'eth_forcenonce': {key: 'E', args: 1, description: 'Force nonce transaction number for Ethereum [argument: integer]'}
});

var userid;
var passwd;
if (ops.userid && ops.passwd) {
   userid = ops.userid;
   passwd = ops.passwd;
} else {
  console.log("\n"+' Internet of Coins CLI wallet - for help, run: ./cli-wallet --help'+"\n");
  process.exit(0);
}

var symbol = ops.pubkey ? ops.pubkey
  : ops.privkey ? ops.privkey
    : ops.keypair ? ops.keypair
      : typeof ops.rawtransaction !== 'undefined' && ops.rawtransaction[0] ? ops.rawtransaction[0] : null;

var progress = [];

var actions = [
  'init',
  {username: userid, password: passwd}, 'session',
  {host: hostname}, 'addHost'
];

if (ops.new) {
  progress.push('new');
  console.log(' *** TODO *** ');
}

if (ops.balance) {
  progress.push('balance');
  actions.push({symbol:ops.balance});
  actions.push('addAsset');
  actions.push({symbol:ops.balance});
  actions.push('getAddress');
  actions.push(address => { return {query:'/asset/'+ops.balance+'/balance/'+address}; });
  actions.push('rout');
}

if (ops.rawtransaction) {
  progress.push('rawtx');
  var amount = ops.rawtransaction[1];
  var target = ops.rawtransaction[2];
  actions.push({symbol:symbol, amount:Number(amount), target:target });
  actions.push('rawTransaction');
}

if (ops.sendtransaction) {
  progress.push('sendtx');
  var amount = ops.sendtransaction[1];
  var target = ops.sendtransaction[2];
  actions.push({symbol:symbol, amount:Number(amount), target:target });
  actions.push('sendTransaction');
}

if (ops.address) {
  progress.push('address');
  actions.push({symbol:ops.address});
  actions.push('addAsset');
  actions.push({symbol:ops.address});
  actions.push('getAddress');
}

if (ops.publickey) {
  progress.push('publickey');
  actions.push({symbol:ops.publickey});
  actions.push('addAsset');
  actions.push({symbol:ops.publickey});
  actions.push('getPublicKey');
}

if (ops.secretkey) {
  progress.push('secretkey');
  actions.push({symbol:ops.secretkey});
  actions.push('addAsset');
  actions.push({symbol:ops.secretkey});
  actions.push('getPrivateKey');
}

if (ops.keysobject) {
  progress.push('keys');
  actions.push({symbol:ops.keysobject});
  actions.push('addAsset');
  actions.push({symbol:ops.keysobject});
  actions.push('getKeys');
}

// show progress
makeProgressBar(progress.join(','));

// take action
hybridd.sequential( 
  actions
  , (data) => {
      if(!ops.quiet) {
        setTimeout(function() { // timeout to ensure bar is updated to 100% properly
          process.stdout.write('\033[1A'); // move cursor up one line (solves progress meter bug)
          bar.update(1);
          console.log("\n"+(typeof data==='string'||typeof data==='number'?data:JSON.stringify(data))+"\n");
        },200);
      } else {
        console.log((typeof data==='string'||typeof data==='number'?data:JSON.stringify(data)));
      }
    }
  , (error) => { console.error("\n"+'Error: ' + error); process.exit(1); }
  , ops.quiet ? undefined : (progress) => { bar.update(progress); }
);
