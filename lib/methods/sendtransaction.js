exports.key = 's';
exports.args = 3;
exports.description = 'Send transaction [argument: symbol] [argument: amount] [argument: target_address]';

exports.test = {
  'dummy 10 _dummyaddress_': 'TX01'
};

exports.sendtransaction = (ops) => (symbol, amount, target) => {
  const tx = {symbol, amount, target, validate: !ops.novalidate};
  const actions = [];
  if (ops.importKey) actions.push({symbol, privateKey: ops.importKey}, 'setPrivateKey');
  if (ops.forceEthNonce) {
    actions.push(
      {symbol:symbol}, 'getAddress',
      source => {
        return {query:'/a/' + symbol + '/unspent/' + source};
      }, 'rout',
      unspent => {
        unspent.nonce = ops.forceEthNonce;
        tx.unspent = unspent;
        return tx;
      }
    );
  } else {
    actions.push(tx);
  }
  actions.push('transaction');
  return actions;
};
