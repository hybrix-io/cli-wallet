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
  proposal => {
    if (typeof proposal !== 'object' || proposal === null) {
      return [{condition: false, message: 'Failed to process request to accept deal ' + dealID + '.'}, 'assert'];
    } else if (typeof proposal.deal !== 'object' || proposal.deal === null) {
      return [{condition: false, message: 'Deal ' + dealID + ' could not be found.'}, 'assert'];
    } else if (proposal.deal.status === 'open' && Number(proposal.deal.progress) === 0) { // claim
      return [
        {symbol: proposal.deal.ask.symbol, amount: proposal.deal.ask.amount, target: proposal.deal.ask.target}, 'transaction',
        txid => (
          {
            claim: [{query: '/e/deal/claim/' + dealID + '/' + txid}, 'rout'],
            txid: {data: txid, step: 'id'}
          }
        ), 'parallel',
        result => result.txid
      ];
    } else {
      return [{condition: false, message: 'Deal ' + dealID + ' has ' + proposal.deal.status + ' status. Acceptance request denied.'}, 'assert'];
    }
  },
  'sequential'
];
