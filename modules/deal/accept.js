const {getLogin} = require('../../lib/setup');

exports.key = 'Y';
exports.args = 1;
exports.host = 'allocation';
exports.description = 'Accept a deal and send funds [argument: dealID]';

exports.dealAccept = (ops) => (dealID) => [
  getLogin(ops, {...this, host: ''}), 'session',
  {query: '/e/deal/status/' + dealID}, 'rout'
  /*
  obj => ({
    accountID: {data: obj.accountID, step: 'id'},
    txid: [{symbol:obj.deal.ask.symbol, amount:obj.deal.ask.amount, target:obj.deal.ask.target}, 'transaction'],
  }), 'parallel',
  obj => { return {query: '/e/deal/claim/' + obj.accountID + '/' + obj.txid}; }, 'rout' */
];
