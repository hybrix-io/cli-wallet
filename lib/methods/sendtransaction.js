exports.key = 's';
exports.args = 3;
exports.description = 'Send transaction [argument: symbol] [argument: amount] [argument: target_address]';

exports.sendtransaction = (ops) => ([symbol, amount, target]) => {
  const tx = {symbol, amount, target, validate: !ops.novalidate};
  const actions = [];
  if (ops.forceEthNonce) {
    actions.push(
      {query: '/a/eth/unspent/' + target}, 'rout',
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
