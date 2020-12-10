const {getLogin} = require('../../lib/setup');

exports.args = 1;
exports.host = 'allocation';
exports.description = 'Accept a deal and send funds [argument: dealID]';

exports.accept = (ops) => (dealID) => [
  getLogin(ops, {...this, host: ''}), 'session',
  keys => ({
    id: [{data: 'account ' + keys.secretKey}, 'hash', hash => ({data: hash, source: 'hex', target: 'base58'}), 'code'],
    deal: [{query: '/e/deal/status/' + dealID}, 'rout']
  }), 'parallel',
  obj => ((obj.deal.status === 'open' && Number(obj.deal.progress) === 0)
    ? [
      {symbol: obj.deal.ask.symbol, amount: obj.deal.ask.amount, target: obj.deal.ask.target}, 'transaction',
      txid => (
        {
          claim: [{query: '/e/deal/claim/' + dealID + '/' + txid}, 'rout'],
          txid: {data: txid, step: 'id'}
        }
      ), 'parallel',
      result => (result.txid)
    ]
    : [() => 'Deal ' + dealID + ' has ' + obj.deal.status + ' status. Acceptance request denied.']
  ), 'sequential'
];
