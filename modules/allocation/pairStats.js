
exports.args = 0;
exports.host = 'allocation';
exports.description = 'Show pair stats (sorted by volume)';
exports.requireLogin = false;

function sortObj(obj) {
  var array = [];
  for (var key in obj) {
    array.push({pair:key,ask:obj[key].ask,bid:obj[key].bid,volume:obj[key].volume,fee:obj[key].fee,sufficiency:obj[key].sufficiency,liquidity:obj[key].liquidity,updated:obj[key].updated});
  }
  array.sort(function(a, b) {
      return a.volume - b.volume;
  });
  return array;
}

exports.pairStats = (ops) => () => [
  {query: '/e/allocation/pair/stats'}, 'rout',
  obj => {
    return JSON.stringify( sortObj(obj), 0, 2 );
  }
];
