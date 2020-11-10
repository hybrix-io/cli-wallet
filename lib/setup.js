const DEFAULT_HOSTNAME = 'https://api.hybrix.io/';
const DEFAULT_HOSTNAME_ALLOCATIONS = 'http://127.0.0.1:1111/'; // TODO!!!

function getLogin (ops, method) {
  let offset;
  if (ops.offset) offset = ops.offset;
  else if (method.host === 'allocation') offset = 100;
  else offset = 0;

  let username;
  let password;
  if (ops.importKey) {
    username = 'DUMMYDUMMYDUMMY0';
    password = 'DUMMYDUMMYDUMMY0';
  } else if (ops.userid && ops.passwd) {
    username = ops.userid;
    password = ops.passwd;
  }
  return {username, password, offset};
}

function setupHost (ops, method, actions) {
  const hostType = method.host || 'remote';
  if (!hostType === 'none') return;
  let host;
  if (ops.hostname) host = ops.hostname;
  else if (hostType === 'allocation') host = DEFAULT_HOSTNAME_ALLOCATIONS;
  else host = DEFAULT_HOSTNAME;

  actions.push({host}, 'addHost');
}

function setupSession (ops, method, actions) {
  const login = getLogin(ops, method);
  if (login.username && login.password) actions.push(login, 'session');
}

exports.getLogin = getLogin;
exports.session = setupSession;
exports.host = setupHost;
