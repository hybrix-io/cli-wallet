var DJB2 = require('../common/crypto/hashDJB2.js');

var storage = require('./storage.js');
//DEBUG=true;
var Hybrix = require('../interface/hybrix-lib.nodejs.js');
//DEBUG=true;
var hybrixd = new Hybrix.Interface({http: require('http'),https: require('https')});
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

// command line options and init
var ops = stdio.getopt({
  'hostname': {key: 'h', args: 1, description: 'The hostname to use. For local specify: http://127.0.0.1:1111/   Default: https://api.hybrix.io/'},
  'API': {key: 'A', args: 1, description: 'Perform an API call [argument: API_path]'},
  'userid': {key: 'u', args: 1, description: 'Set username'},
  'passwd': {key: 'p', args: 1, description: 'Set password'},
  'importKey': {key: 'i', args: 1, description: 'Import private key'},
  'create': {key: 'c', description: 'Generate new deterministic account'},
  'address': {key: 'a', args: 1, description: 'Get address of account [argument: symbol]'},
  'balance': {key: 'b', args: 1, description: 'Get the balance of an address [argument: symbol]'},
  'rawtransaction': {key: 'r', args: 3, description: 'Create a raw transaction [argument: symbol] [argument: amount] [argument: target_address]'},
  'sendtransaction': {key: 's', args: 3, description: 'Send transaction [argument: symbol] [argument: amount] [argument: target_address]'},
  'publickey': {key: 'P', args: 1, description: 'Get public key from account [argument: symbol]'},
  'secretkey': {key: 'S', args: 1, description: 'Get private key from account [argument: symbol]'},
  'keysobject': {key: 'K', args: 1, description: 'Get internal keys object from account [argument: symbol]'},
  'quiet': {key: 'q', args: 0, description: 'No extra output other than raw data'},
  'forceEthNonce': {key: 'FE', args: 1, description: 'Force nonce transaction number for Ethereum [argument: integer]'}
  //'string': {key: 'e', args: 0, description: 'Make escaped string output for rawtransaction'},
});

// let there be a default hostname if empty
var defaultHostname = 'https://api.hybrix.io/';
var hostname = ops.hostname || defaultHostname;

var userid;
var passwd;
var importKey;
if (ops.importKey) {
  importKey = ops.importKey;
  userid = 'DUMMYDUMMYDUMMY0';
  passwd = 'DUMMYDUMMYDUMMY0';
} else if (ops.userid && ops.passwd) {
   userid = ops.userid;
   passwd = ops.passwd;
} else {
  if(!ops.create && !ops.API) {
    console.log("\n"+' Internet of Coins CLI wallet - for help, run: ./cli-wallet --help'+"\n");
    process.exit(0);
  }
}

var symbol = ops.balance ? ops.balance
 : ops.address ? ops.address
  : ops.publickey ? ops.publickey
    : ops.secretkey ? ops.secretkey
      : ops.keysobject ? ops.keysobject
        : typeof ops.rawtransaction !== 'undefined' && ops.rawtransaction[0] ? ops.rawtransaction[0]
          : typeof ops.sendtransaction !== 'undefined' && ops.sendtransaction[0] ? ops.sendtransaction[0] : null;

var progress = [];

// do we have local storage of blob?
metahash = false;
var compareHashesAndImport = function(data, dataCallback, errorCallback) {
  if(typeof data.hash!=='undefined') {
    var modename = data.deterministic.split('.')[0];
    var metadata = storage.Meta({key:'deterministic-'+modename,local:true});
    if(metadata) {
      try {
        metahash = JSON.parse(metadata).hash;
      } catch(e) {
        metahash = false;
      }
    }
    if(data.hash===metahash) {
      storage.Get({key:'deterministic-'+modename,local:true},
        function(blob) {
          hybrixd.sequential(
            [
              {id: modename, blob: blob},
              'import'
            ],
            (data) => { dataCallback({import:true,symbol:data}); },
            (error) => { console.log('Import error!!!'); errorCallback(error); }
          );
        }
      );
    } else { dataCallback({import:false,symbol:symbol}); }
  } else { dataCallback({import:false,symbol:symbol}); }
}

var actions;
if (ops.create) {
  progress.push('create');
  actions = ['createAccount'];
} else if(userid && passwd) {
  actions = [
    'init',
    {username: userid, password: passwd}, 'session',
    {host: hostname}, 'addHost',
    {query:'s/deterministic/hash/'+symbol},'rout',
    remotehash => { return {data: remotehash, func: compareHashesAndImport}; }, 'call'
  ];
  if(importKey) {
    actions.splice(5,0,{symbol:symbol,privateKey:importKey},'setPrivateKey');
  }
} else {
  actions = [
    'init',
    {host: hostname}, 'addHost',
  ];
}

if (ops.API) {
  if(ops.API==='/') {
    console.log("\n"+'Please pass a path to query the API!'+"\n");
    process.exit(1);
  } else {
    progress.push('API');
    actions.push({query:ops.API});
    actions.push('rout');
  }
}

if (ops.balance) {
  progress.push('balance');
  actions.push({symbol:symbol});
  actions.push('addAsset');
  actions.push({symbol:symbol});
  actions.push('getAddress');
  actions.push(address => { return {query:'/asset/'+ops.balance+'/balance/'+address}; });
  actions.push('rout');
}

if (ops.rawtransaction) {
  progress.push('rawtx');
  var amount = ops.rawtransaction[1];
  var target = ops.rawtransaction[2];
  var tx = {symbol:symbol, amount:amount, target:target };
  if(ops.forceEthNonce) {
    tx.unspent = {nonce:ops.forceEthNonce};
  }
  actions.push(tx);
  actions.push('rawTransaction');
  actions.push( result => { return result.replace(/[*+?^${}()|[\[\]\\\"']/g, '\\$&'); } );  // proper escapes for terminal output
}

if (ops.sendtransaction) {
  progress.push('sendtx');
  var amount = ops.sendtransaction[1];
  var target = ops.sendtransaction[2];
  var tx = {symbol:symbol, amount:amount, target:target };
  if(ops.forceEthNonce) {
    tx.unspent = ops.forceEthNonce;
  }
  actions.push(tx);
  actions.push('transaction');
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
hybrixd.sequential(
  actions,
  (data) => {
              if(!ops.quiet) {
                setTimeout(function() { // timeout to ensure bar is updated to 100% properly
                  process.stdout.write('\033[1A'); // move cursor up one line (solves progress meter bug)
                  bar.update(1);
                  console.log("\n"+(typeof data==='string'||typeof data==='number'?data:JSON.stringify(data))+"\n");
                },200);
              } else {
                console.log((typeof data==='string'||typeof data==='number'?data:JSON.stringify(data)));
              }
              // store the deterministic blobs for next time usage
              hybrixd.sequential(
                ['export'],
                (data) => {
                  for (var key in data){
                    if (data.hasOwnProperty(key)) {
                      if (metahash !== DJB2.hash(data[key]) ) {
                        storage.Set({key:'deterministic-'+key,value:data[key],local:true},
                          function(blob) {
                            console.log('Storing key ' + key); // + data[key]);
                          },
                          function(error) {
                            console.log('Error storing key ' + key + ': '+error); // + data[key]);
                          }
                        );
                      }
                    }
                  }
                },
                (error) => { console.error("\n"+'Error storing blobs: ' + error); }
              );
            },
  (error) => {
    var errorMsg;
    try {
      error = JSON.parse(error);
    } catch(e) {}
    if(error && error.help) {
      errorMsg = error.help.replace(/<br\/>/g,'\n');
    } else {
      errorMsg = error;
    }
    console.error("\n\n"+'Error: ' + JSON.stringify(errorMsg));
    process.exit(1);
  },
  ops.quiet ? undefined : (progress) => { bar.update(progress); }
);
