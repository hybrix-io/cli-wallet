#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
NODEINST=`which node`

# $HYBRIDD/interface/scripts/npm  => $HYBRIDD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIDD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

INTERFACE="$HYBRIDD/interface"
NODE="$HYBRIDD/node"
DETERMINISTIC="$HYBRIDD/deterministic"
NODEJS="$HYBRIDD/nodejs"
COMMON="$HYBRIDD/common"
WEB_WALLET="$HYBRIDD/web-wallet"

GREEN="\033[0;32m"
RED="\033[0;31m"
RESET="\033[0m"


if [ -e "$COMMON/scripts/diag/diag.sh" ];then

    sh "$COMMON/scripts/diag/diag.sh"

else

    echo "$RED [!] common not found.$RESET"

fi



export PATH="$OLDPATH"
cd "$WHEREAMI"
