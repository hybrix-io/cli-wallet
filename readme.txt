-------------------------------------------------------------------------------
Internet of Coins cli-wallet.
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

Get BTC Balance for a certain wallet:

 $ ./cli-wallet -A "/asset/btc/balance/1KxCfRB6y7F5TcR7Jg9CozUxqxcm5pA54a"

You should see:

[.] API: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

1012.27930302

For more API operations, please refer to docs/docs-hybrixd-api.txt

-------------------------------------------------------------------------------
npm tasks
-------------------------------------------------------------------------------

This project includes several npm tasks that make life easier. They are:

 - npm run setup                    Set up the project for development
 - npm run diag                     Perform a diagnostic cycle
 - npm run generate_docs            Generate documentation from the "node" project