// storage.js :: higher level storage functions
// web version depends on localforage.nopromises.min.js

var storage = (function() {

  var fs = require('fs');
  var storepath = __dirname+'/../storage/';
  var DJB2 = require('../common/crypto/hashDJB2.js');

  function makeDir(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      fs.mkdirSync(dirname);
    }
  }

  var GetFile = function(storekey,postfunction) {
    var result = null;
    if(typeof storekey=='string') {
      var fold = storekey.substr(0,2)+'/';
      if(fs.existsSync(storepath+fold+storekey)) {
        result = String(fs.readFileSync(storepath+fold+storekey));
        if(typeof postfunction === 'function') {
            postfunction( result );
        }
      } else { if(typeof postfunction === 'function') { postfunction(null); } }
    } else { if(typeof postfunction === 'function') { postfunction(null); } }
    return result;
  }

  var SetFile = function(storekey,storevalue) {
    var fold = storekey.substr(0,2)+'/';
    makeDir(storepath);
    makeDir(storepath+fold);
    fs.writeFileSync(storepath+fold+storekey, storevalue);
    fs.writeFileSync(storepath+fold+storekey+'.meta',JSON.stringify({time:Date.now(),hash:DJB2.hash(storevalue)}));
  }


//
// TODO: rewrite Sync mechanism to use interface
//

  var Sync = function(storekey,postfunction) {
    // compare meta data
    var loop_step = next_step();
    hybrixdcall({r:'s/storage/meta/'+storekey,c:GL.usercrypto,s:loop_step,z:0},0, function(object) {
      var meta = object.data;
      if(typeof meta==='undefined' || meta===null || meta==='null') {
        meta = {time:0,hash:null}
      }
      GetFile(storekey+'.meta',function(localmeta) {
        try { var localmeta = JSON.parse(localmeta); } catch(err) {}
        if(localmeta===null) { localmeta = {time:0,hash:0}; }
        // difference detected
        var meta = this.meta;
        // DEBUG: logger(' KEY: '+storekey+' HASHES: '+meta.hash+' '+localmeta.hash);
        if(meta.hash!==localmeta.hash) {
          // remote is newer
          if(meta.time>localmeta.time) {
            var loop_step = next_step();
            hybrixdcall({r:'s/storage/get/'+storekey,c:GL.usercrypto,s:loop_step,z:0},0, function(object) {
              if(typeof object.data==='undefined' || object.data===null || object.data==='null') {
                GetFile(storekey,function(value) {
                  if(typeof postfunction === 'function') {
                    postfunction(value);
                  }
                });
              } else {
                if(typeof postfunction === 'function') {
                 postfunction(object.data);
                }
                try {
                  SetFile(storekey, object.data);
                  return true;
                } catch(e) {
                  return false;
                }
              }
            });
          // remote is older
          } else {
            GetFile(storekey,function(value) {
              if(typeof postfunction === 'function') {
                postfunction(value);
              }
              var loop_step = next_step();
              hybrixdcall({r:'s/storage/set/'+storekey+'/'+value,c:GL.usercrypto,s:loop_step,z:0},0, function(object) {
                // add to proof of work queue
                if(typeof object.data === 'string' && (meta.res !== 'undefined' && meta.res !== 1) && typeof GL.powqueue !== 'undefined' && GL.powqueue.indexOf(meta.res) === -1) {
                  GL.powqueue.push(storekey+'/'+object.data);
                }
              });
            });
          }
        // no changes between remote and local
        } else {
          GetFile(storekey,function(value) {
            if(typeof postfunction === 'function') {
              postfunction(value);
            }
            if((meta.res !== 'undefined' && meta.res !== 1) && typeof GL.powqueue !== 'undefined' && GL.powqueue.indexOf(meta.res) !== -1) {
              // add to proof of work queue
              GL.powqueue.push(storekey+'/'+meta.res);
            }
          });
        }
      }.bind({meta:meta}));
    });
  }

	var storage = {

    // {key:storekey, value:storevalue, local:false}
    Set : function(data,dataCallback,errorCallback) {
      if(typeof data.key!=='undefined') {
        if(typeof data.value==='string') {
          SetFile(data.key,data.value);
          if(!data.local) {
            setTimeout(function(data) {
              var error = 'Error: Synchronized storage not yet supported!';
              console.log(error);
              //Sync(data.key, function(result) { dataCallback(result); });
            },2000,data);
          }
          return true;
        } else {
          var error = 'Error: you may only store strings!';
          errorCallback(error);
          return error;
        }
      } else {
        var error = 'Error: you must specify key to get!';
        errorCallback(error);
        return error;
      }
    },

    // {key:storekey,local:false}
    Get : function(data,dataCallback,errorCallback) {
      if(typeof data.key!=='undefined') {
        if(data.local) {
          GetFile(data.key, function(value) {
            dataCallback(value);
          });
        } else {
          var error = 'Error: Synchronized storage not yet supported!';
          errorCallback(error);
          //Sync(data.key, function(value) { dataCallback(value); });
        }
        return true;
      } else {
        var error = 'Error: you must specify key to get!';
        errorCallback(error);
        return error;
      }
    },

    // {key:storekey}
    Del : function(data,dataCallback,errorCallback) {
      if(data.key) {
        var storekey = data.key;
        try {
          var fold = storekey.substr(0,2)+'/';
          fs.unlinkSync(storepath+fold+storekey);
          dataCallback(storepath+fold+storekey);
          return true;
        } catch(e) {
          errorCallback(e);
          return e;
        }
      } else {
        var error = 'Error: you must specify key to get!';
        errorCallback(error);
        return error;
      }
    },
    
    Meta : function(data,dataCallback,errorCallback) {
      var result = null;
      if(data.key) {
        try {
          result = GetFile(data.key+'.meta', dataCallback);
        } catch(e) {
          errorCallback('Error: specified key does not exist!');
        }
      } else {
        errorCallback('Error: you must specify key to query!');
      }
      return result;
    }
  }
  
  return storage;

})();

if (typeof define === 'function' && define.amd) {
  define(function () { return storage; });
} else if( typeof module !== 'undefined' && module != null ) {
  module.exports = storage;
} else if( typeof angular !== 'undefined' && angular != null ) {
  angular.module('storage', [])
  .factory('storage', function () {
    return storage;
  });
}
