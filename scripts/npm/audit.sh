#!/bin/sh
WHEREAMI="`pwd`";
OLDPATH="$PATH"

# $CLI_WALLET/scripts/npm  => $CLI_WALLET
SCRIPTDIR="`dirname \"$0\"`"
WEB_WALLET="`cd \"$SCRIPTDIR/../..\" && pwd`"

export PATH="$CLI_WALLET/node_binaries/bin:$PATH"

cd "$CLI_WALLET"
echo "[.] Auditing cli-wallet..."
npm i
npm update
npm audit fix --force

export PATH="$OLDPATH"
cd "$WHEREAMI"
