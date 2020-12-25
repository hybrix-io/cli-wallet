-------------------------------------------------------------------------------
hybrix cli-wallet.
-------------------------------------------------------------------------------

A command line wallet for checking balances and performing transactions.

-------------------------------------------------------------------------------
Prerequisites:
-------------------------------------------------------------------------------

Node.js

-------------------------------------------------------------------------------
About the wallet
-------------------------------------------------------------------------------

This wallet communicates with a Hybrix node. It assumes this node is running on your local machine.
Use the -h or --hostname flag to specify another endpoint.

Get a list of operations:
 $ ./cli-wallet --help

Creating a new wallet is easy:
 $ ./cli-wallet --create

To get the Bitcoin balance in your wallet type:
 $ ./cli-wallet --balance btc --username USERNAME --password PASSWORD

You can also get the address belonging to Ethereum in your wallet:
 $ ./cli-wallet --address eth --username USERNAME --password PASSWORD

To send a Dogecoin transaction you can do the following:
 $ ./cli-wallet --sendtransaction doge 1 DAJXE83WEsiyMYiG2CVmp3kZ9MafrmkH5c --username USERNAME --password PASSWORD

It is also possible to create the transaction without sending it:
 $ ./cli-wallet --rawtransaction doge 1 DAJXE83WEsiyMYiG2CVmp3kZ9MafrmkH5c --username USERNAME --password PASSWORD

To export your public key you can do this:
 $ ./cli-wallet --publickey nxt --username USERNAME --password PASSWORD

Exporting your private key can also be done:
 $ ./cli-wallet --secretkey trx --username USERNAME --password PASSWORD

Direct API calls can be done in session like this:
 $ ./cli-wallet --username USERNAME --password PASSWORD -A /engine/storage/load/someKey

To get BTC Balance for a certain address:
 $ ./cli-wallet -A "/asset/btc/balance/1KxCfRB6y7F5TcR7Jg9CozUxqxcm5pA54a"

You should see:

[.] API: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

1012.27930302

If you want to include cli-wallet in a shell script, you may want to use the -q (quiet) option to make it easier to use the output of the command.
./cli-wallet --username USERNAME --password PASSWORD -q -b ltc

For more API operations, please refer to docs/docs-hybrixd-api.txt

-------------------------------------------------------------------------------
npm tasks
-------------------------------------------------------------------------------

This project includes several npm tasks that make life easier. They are:

 - npm run setup                    Set up the project for development
 - npm run diag                     Perform a diagnostic on dev setup
 - npm run generate_docs            Generate documentation from the "node" project
 - npm run test                     Run tests
