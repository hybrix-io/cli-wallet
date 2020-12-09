
exports.args = 0;
exports.description = 'Get list of pending transactions ';

function padd (x) {
  return x < 10 ? '0' + x : x;
}

function timestampToDate (timestamp) {
  const d = new Date(timestamp);
  return padd(d.getDate()) + '-' + padd(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
}

/*
TODO
- filter on symbol (when hybrix-jslib allows for this)
- whether or not to update
- whether or not to remove
 */
exports.pending = (ops) => () => [{}, 'getPending', pendingTransactions => {
  let s = '';
  for (let ref in pendingTransactions) {
    const pendingTransaction = pendingTransactions[ref];
    const meta = pendingTransaction.meta;
    s += timestampToDate(pendingTransaction.timestamp) + ' ';
    switch (pendingTransaction.status) {
      case 0: s += '[PENDING] '; break;
      case 1: s += '[SUCCESS] '; break;
      case -1: s += '[FAILURE] '; break;
    }

    switch (pendingTransaction.type) {
      case 'regular' : {
        s += meta.amount + ' ' + meta.symbol.toUpperCase() + ' to ' + meta.target + ' id:' + meta.id + '\n';
        break;
      }
      default:
        s += ' Unknown pending transaction type: ' + pendingTransaction.type + '\n';
    }
  }
  return s;
}];
