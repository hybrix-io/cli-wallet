exports.key = 'D';
exports.args = 2;
exports.host = 'allocation';
exports.description = 'Deposit an amount into an allocation account [argument: symbol] [argument: amount]';

exports.allocationDeposit = (ops) => ([symbol, amount]) => [
  {symbol}, 'getAddress', // get allocation address
  target => { // create a transaction from regular session to allocation session
    return [
      {username: ops.userid, password: ops.passwd}, 'session',
      {symbol, amount, target}, 'transaction'
    ];
  }, 'sequential'
];
