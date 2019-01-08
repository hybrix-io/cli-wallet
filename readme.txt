Internet of Coins cli-wallet. A command line wallet for checking balances and performing transactions.

Prerequisites:
 - Node.js

This wallet communicates with a Hybrix node. It assumes this node is running on your local machine.
Use the -h or --hostname flag to specify another endpoint.

Get a list of operations:

 $ ./cli-wallet --help

Get BTC Balance for a certain wallet:

 $ ./cli-wallet -A "/asset/btc/balance/1KxCfRB6y7F5TcR7Jg9CozUxqxcm5pA54a"

You should see:

[.] API: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

1012.27930302

