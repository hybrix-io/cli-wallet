const DJB2 = require('../common/crypto/hashDJB2.js');

const storage = require('./storage.js');
const Hybrix = require('../interface/hybrix-lib.nodejs.js');
const hybrixd = new Hybrix.Interface({http: require('http'),https: require('https')});
const ProgressBar = require('progress');
const stdio = require('stdio');

const DEFAULT_HOSTNAME = 'https://api.hybrix.io/';

let bar;

function makeProgressBar(title) {
  bar = new ProgressBar(' [.] '+title+': [:bar] :percent, eta: :etas', {
    complete: '▓',
    incomplete: '░',
    width: 76-title.length,
    total: 100
  });
}

// command line options and init
const ops = stdio.getopt({
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
  'forceEthNonce': {key: 'FE', args: 1, description: 'Force nonce transaction number for Ethereum [argument: integer]'},
  'novalidate': {key: 'n', args: 0, description: 'Skip validation of target address and available balance before transaction'},
  'debug': {key: 'd', args: 0, description: 'Run in debug mode'}
  //'string': {key: 'e', args: 0, description: 'Make escaped string output for rawtransaction'},
});

DEBUG = ops.debug

const hostname = ops.hostname || DEFAULT_HOSTNAME;

let userid;
let passwd;
let importKey;
if (ops.importKey) {
  importKey = ops.importKey;
  userid = 'DUMMYDUMMYDUMMY0';
  passwd = 'DUMMYDUMMYDUMMY0';
} else if (ops.userid && ops.passwd) {
  userid = ops.userid;
  passwd = ops.passwd;
} else {
  if(!ops.create && !ops.API) {
    console.log("\n"+' hybrix CLI wallet - for help, run: ./cli-wallet --help'+"\n");
    process.exit(0);
  }
}

const symbol = ops.balance ? ops.balance
    : ops.address ? ops.address
    : ops.publickey ? ops.publickey
    : ops.secretkey ? ops.secretkey
    : ops.keysobject ? ops.keysobject
    : typeof ops.rawtransaction !== 'undefined' && ops.rawtransaction[0] ? ops.rawtransaction[0]
    : typeof ops.sendtransaction !== 'undefined' && ops.sendtransaction[0] ? ops.sendtransaction[0] : null;

const progress = [];

const exportBlob = (mode,blob,dataCallback, errorCallback) =>
      storage.Set({key:'deterministic-'+mode,value:blob,local:true},
                  () => {
                    if(!ops.quiet) console.log('[i] Storing key ' + mode);
                    dataCallback()
                  },
                  errorCallback
                 );

const importBlob = (details, dataCallback, errorCallback)=>{
  const mode = details.mode.split('.')[0];

  storage.Get({key:'deterministic-'+mode,local:true},
              blob => {
                if(blob === null) return dataCallback();
                return hybrixd.import(
                  {id: mode, blob},
                  importResponse =>  {
                    if(importResponse.newerVersionAvailable) exportBlob (mode,blob,dataCallback, errorCallback)
                    else dataCallback()
                  },
                  error =>  {console.log('[!] Import error!!!'); errorCallback(error)}
                );
              }
             );
}


const actions = [];
if (ops.create) {
  progress.push('create');
  actions.push('createAccount');
} else if(userid && passwd) {
  actions.push(
    {username: userid, password: passwd}, 'session',
    {host: hostname}, 'addHost',
    {query:'/a/'+symbol+'/details'},'rout',
    {func:importBlob}, 'call'
  );
  if(importKey) {
    actions.splice(5,0,{symbol:symbol,privateKey:importKey},'setPrivateKey');
  }
} else {
  actions.push(
    {host: hostname}, 'addHost'
  );
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
  actions.push({symbol});
  actions.push('addAsset');
  actions.push({symbol});
  actions.push('getAddress');
  actions.push(address => { return {query:'/asset/'+ops.balance+'/balance/'+address}; });
  actions.push('rout');
}

if (ops.rawtransaction) {
  progress.push('rawtx');
  const amount = ops.rawtransaction[1];
  const target = ops.rawtransaction[2];
  const tx = {symbol, amount, target, validate:!ops.novalidate};
  if (ops.forceEthNonce) {
    actions.push(
      {query: '/a/eth/unspent/'+target},'rout',
      unspent => {
        unspent.nonce = ops.forceEthNonce;
        tx.unspent = unspent
        return tx
      }
    );
  } else {
    actions.push(tx);
  }
  actions.push('rawTransaction');
  actions.push( result => { return result.replace(/[*+?^${}()|[\[\]\\\"']/g, '\\$&'); } );  // proper escapes for terminal output
}

if (ops.sendtransaction) {
  progress.push('sendtx');
  const amount = ops.sendtransaction[1];
  const target = ops.sendtransaction[2];
  const tx = {symbol, amount, target };
  if (ops.forceEthNonce) {
    actions.push(
      {query: '/a/eth/unspent/'+target},'rout',
      unspent => {
        unspent.nonce = ops.forceEthNonce;
        tx.unspent = unspent
        return tx
      }
    );
  } else {
    actions.push(tx);
  }
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
    hybrixd.export({},
      blobs => {
        for (let id in blobs){
          storage.Set({key:'deterministic-'+id,value:blobs[id],local:true},
                      blob => { if(!ops.quiet) console.log('[i] Storing blob ' + id);},
                      error =>  console.error('[!] Error storing blob ' + id + ': '+error)
                     );
        }
      },
      error =>  console.error("\n"+'[!] Error storing blobs: ' + error)
    );
  },
  (error) => {
    try {
      error = JSON.parse(error);
    } catch(e) {}
    const errorMsg = error && error.help
       ? error.help.replace(/<br\/>/g,'\n')
          : error;
    console.error("\n\n"+'[!] Error: ' + JSON.stringify(errorMsg));
    process.exit(1);
  },
  ops.quiet ? undefined : (progress) => { bar.update(progress); }
);
