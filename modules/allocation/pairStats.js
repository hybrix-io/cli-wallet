
exports.args = 0;
exports.host = 'allocation';
exports.description = 'Show pair stats (sorted by volume)';
exports.requireLogin = false;

function sortPairsByVolume (pairs) {
  return Object.entries(pairs)
    .map(([pair, pairData]) => ({pair, ...pairData}))
    .sort((a, b) => a.volume - b.volume);
}

exports.pairStats = ops => () => [
  {query: '/e/swap/allocation/pair/stats'}, 'rout',
  pairs => JSON.stringify(sortPairsByVolume(pairs), 0, 2)
];
