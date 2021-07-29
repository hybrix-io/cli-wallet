exports.key = 'r';
exports.args = 3;
exports.description = 'Create a raw transaction [argument: symbol] [argument: amount] [argument: target_address]';

exports.test = {
  'dummy 10 _dummyaddress_': '_dummytransaction_1000000000_15000000'
};

exports.getTransactionActions = getTransactionActions;

function getTransactionActions (ops, tx, symbol, amount, target) {
  const actions = [];
  if (ops.importKey) actions.push({symbol, privateKey: ops.importKey}, 'setPrivateKey');
  if (ops.forceUnspent) {
    let parsedUnspent;
    try {
      parsedUnspent = JSON.parse(ops.forceUnspent);
    } catch (error) {
      return [{condition: false, message: `Failed to parse unspent: ${error}`}, 'assert'];
    }
    tx.unspent = parsedUnspent;
  }
  if (ops.forceEthNonce) {
    actions.push(
      {symbol, offset: ops.offset || 0 }, 'getAddress',
      source => {
        return {query: '/a/' + symbol + '/unspent/' + source};
      }, 'rout',
      unspent => {
        unspent.nonce = ops.forceEthNonce;
        tx.unspent = unspent;
        return tx;
      }
    );
  } else actions.push(tx);
  return actions;
}

exports.rawtransaction = (ops) => (symbol, amount, target) => {
  const tx = {symbol, amount, offset: ops.offset || 0, target, validate: !ops.novalidate};
  const actions = getTransactionActions(ops, tx, symbol, amount, target);
  actions.push('rawTransaction');
  actions.push(result => { return result.replace(/[*+?^${}()|[[\]\\"']/g, '\\$&'); }); // proper escapes for terminal output
  return actions;
};
