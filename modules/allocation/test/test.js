const Hybrix = require('../../../interface/hybrix-lib.nodejs.js');
const hybrix = new Hybrix.Interface({http: require('http')});

const {cliWallet} = require('../../../lib/child.js');

const ADDRESS = '638';
const START_BALANCE = 100;
const SECURITY_SYMBOL = 'mock.eth';

const DEFAULT_DEPOSIT = 10;
const EXTRA_DEPOSIT = 30;
const EXTRA_WITHDRAW = 10;
const SECURITY_DEPOSIT = 20;
const SECURITY_WITHDRAW = 5;
function logger (text) {
  console.log('[.] ', text);
}

function errorCallback (error) {
  console.error('[!] ', error);
}

hybrix.sequential([
  {host: 'http://127.0.0.1:1111/'}, 'addHost',
  {query: '/e/allocation/security-symbol'}, 'rout',

  symbol => ({condition: symbol === SECURITY_SYMBOL, message: `Expected ${SECURITY_SYMBOL} as security asset.`, symbol}), 'assert',
  ({symbol}) => logger(`Security symbol configured to ${symbol}.`),
  () => logger(`Reset mockchain.`),
  {query: `/e/mockchain/reset`}, 'rout',
  // TODO find allocation -> should fail (because no funds)
  // TODO create allocation -> should fail (because no funds)
  () => logger(`Inialize mock funds.`),
  {query: `/e/mockchain/mine/eth/${ADDRESS}/${START_BALANCE}`}, 'rout',
  {query: `/e/mockchain/mine/btc/${ADDRESS}/${START_BALANCE}`}, 'rout',
  // check balances
  {query: '/a/mock.eth/balance/' + ADDRESS}, 'rout',
  balance => ({condition: Number(balance) === START_BALANCE, message: 'Invalid mock.eth start balance', balance}), 'assert',
  ({balance}) => logger(`${balance} MOCK.ETH available.`),
  {query: '/a/mock.btc/balance/' + ADDRESS}, 'rout',
  balance => ({condition: Number(balance) === START_BALANCE, message: 'Invalid mock.btc start balance', balance}), 'assert',
  ({balance}) => logger(`${balance} MOCK.BTC available.`),

  // create allocation
  () => logger('Create allocation.'),

  {func: cliWallet, data: '--yes --module allocation create'}, 'call', // default of 10
  () => logger('Deposit more funds'),
  {func: cliWallet, data: `--module allocation deposit ${SECURITY_SYMBOL} ${EXTRA_DEPOSIT}`}, 'call',
  () => logger('Withdraw some funds'),
  {func: cliWallet, data: `--module allocation withdraw ${SECURITY_SYMBOL} ${EXTRA_WITHDRAW}`}, 'call',
  () => logger('Check balance'),
  {func: cliWallet, data: `--module allocation balance ${SECURITY_SYMBOL}`}, 'call',

  balance => ({condition: Number(balance) === DEFAULT_DEPOSIT + EXTRA_DEPOSIT - EXTRA_WITHDRAW, message: `Invalid ${SECURITY_SYMBOL} allocation balance`, balance}), 'assert',
  ({balance}) => logger(`${balance} ${SECURITY_SYMBOL.toUpperCase()} available.`),

  // TODO try to set pair, should fail

  () => logger('Deposit security funds'),
  {func: cliWallet, data: `--module allocation securityDeposit ${SECURITY_DEPOSIT}`}, 'call',
  () => logger('Withdraw security funds.'),
  {func: cliWallet, data: `--module allocation securityWithdraw ${SECURITY_WITHDRAW}`}, 'call',

  () => logger('Get security details.'),
  {func: cliWallet, data: '--module allocation securityDetails'}, 'call',
  details => { details = JSON.parse(details); return {condition: Math.abs(details.balance - (SECURITY_DEPOSIT * 0.995 - SECURITY_WITHDRAW)) < 0.0001, message: `Invalid ${SECURITY_SYMBOL} security balance. Got ${details.balance}, expected ${SECURITY_DEPOSIT * 0.995 - SECURITY_WITHDRAW}`, details}; }, 'assert',
  ({details}) => logger(`${details.balance} ${SECURITY_SYMBOL.toUpperCase()} as security deposit at ${details.fee}%.`),

  () => logger('Set pair'),
  {func: cliWallet, data: '--module allocation pairSet mock.btc mock.eth 0.3'}, 'call',
  () => logger('Get pair'),
  {func: cliWallet, data: '--module allocation pairGet mock.btc mock.eth'}, 'call'
  // TODO check amount, balance should be 15 = DEFAULT_DEPOSIT + EXTRA_DEPOSIT - EXTRA_WITHDRAW - SECURITY_DEPOSIT + SECURITY_WITHDRAW
  // TODO  pair delete
  // TODO  get pair -> should fail */

], data => {
  console.log('[v] Done');
}, errorCallback);
