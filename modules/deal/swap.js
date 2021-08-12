const {getLogin} = require('../../lib/setup');

exports.args = 3;
exports.host = 'allocation';
exports.description = 'Request and accept a swap deal [argument: base] [argument: symbol] [argument: target_amount]';

exports.swap = ops => (base, symbol, targetAmount) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {symbol}, 'getAddress', // get primary allocation address
  target => ({query: '/e/swap/deal/proposal/' + base + '/' + symbol + '/' + targetAmount + '/' + target}), 'rout',
  proposal => {
    const dealID = proposal.id;
    const amount = proposal.ask.amount;
    const target = proposal.ask.target;
    const symbol = proposal.ask.symbol;
    return [
      {symbol, amount, target}, 'transaction',
      transactionId => ({query: '/e/swap/deal/claim/' + transactionId + '/' + dealID}), 'rout'
    ];
  }, 'sequential'
];
