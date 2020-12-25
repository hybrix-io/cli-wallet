const readlineSync = require('readline-sync');

const LOCAL_HOSTNAME = 'http://127.0.0.1:1111/';
const LOCAL_NOROOT_HOSTNAME = 'http://127.0.0.1:8080/api/';
const DEFAULT_HOSTNAME = 'https://api.hybrix.io/';
const DEFAULT_HOSTNAME_ALLOCATIONS = 'https://swap.hybrix.io/';
const DEFAULT_ALLOCATION_OFFSET = 100;

function getLogin (ops, method) {
  let offset;
  if (ops.offset) offset = ops.offset;
  else if (method.host === 'allocation') offset = DEFAULT_ALLOCATION_OFFSET;
  else offset = 0;

  let username;
  let password;
  if (ops.importKey) {
    username = 'DUMMYDUMMYDUMMY0';
    password = 'DUMMYDUMMYDUMMY0';
  } else if (ops.username && ops.password) {
    username = ops.username;
    password = ops.password;
  } else if (ops.test) {
    username = 'DUMMYDUMMYDUMMY0';
    password = 'DUMMYDUMMYDUMMY0';
  }
  return {username, password, offset};
}

function setupHost (ops, method, actions) {
  const hostType = method.host || 'remote';
  if (ops.verbose) console.log('[i] hostType = ' + hostType);
  if (hostType === 'none') return;
  let host;
  if (ops.hostname) host = ops.hostname;
  else if (ops.noroot) host = LOCAL_NOROOT_HOSTNAME;
  else if (ops.local) host = LOCAL_HOSTNAME;
  else if (hostType === 'allocation') host = DEFAULT_HOSTNAME_ALLOCATIONS;
  else host = DEFAULT_HOSTNAME;
  if (ops.verbose) console.log('[i] host = ' + host);

  actions.push({host}, 'addHost');
}

function setupSession (ops, method, actions) {
  const login = getLogin(ops, method);
  if (ops.verbose) console.log('[i] requireLogin = ' + method.requireLogin);
  if (method.requireLogin === false || (ops.module && method === 'help')) return; // nothing to do

  if (!login.username) ops.username = login.username = readlineSync.question('Username: ');

  if (!login.password) ops.password = login.password = readlineSync.question('Password: ', {hideEchoBack: true});
  if (ops.verbose) {
    console.log('[i] username = ' + login.username);
    console.log('[i] password = ' + (login.password ? '***' : undefined));
  }
  if (login.username && login.password) actions.push(login, 'session');
}

exports.getLogin = getLogin;
exports.session = setupSession;
exports.host = setupHost;
