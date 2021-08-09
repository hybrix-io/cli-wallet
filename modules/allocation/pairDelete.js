const {getLogin} = require('../../lib/setup');
exports.args = 2;
exports.host = 'allocation';
exports.description = 'Delete an allocation pair, making it unavailable [argument: base] [argument: symbol]';
function stringify (x) {
  return typeof x === 'undefined' ? 'undefined' : x;
}
function getSignature (qrtzMethodId, accountID, parameters, secretKey) {
  return [qrtzMethodId, accountID, ...parameters, secretKey].map(stringify).join('-');
}

// Nb: the qrtzMethodId is the qrtz method name so 'deletePair' and not 'pairDelete' or 'pair/delete'
function getSignatureSteps (ops, method, qrtzMethodId, parameters) {
  return [
    getLogin(ops, method), 'getLoginKeyPair',
    {
      keys: [keys => keys],
      accountID: [
        keys => ({data: 'account ' + keys.secretKey}), 'hash',
        hash => ({data: hash, source: 'hex', target: 'base58'}), 'code'
      ]
    },
    'parallel',
    {
      accountID: [({accountID}) => accountID],
      signature: [({keys, accountID}) => getSignature(qrtzMethodId, accountID, parameters, keys.secretKey), 'hash']
    },
    'parallel'
  ];
}

exports.getSignatureSteps = getSignatureSteps;

exports.pairDelete = (ops) => (fromBase, toSymbol) => [
  ...getSignatureSteps(ops, this, 'deletePair', [fromBase, toSymbol]),
  ({accountID, signature}) => ({query: '/e/swap/allocation/pair/delete/' + accountID + '/' + fromBase + '/' + toSymbol + '/' + signature}), 'rout'
];
