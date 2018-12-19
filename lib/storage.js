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
