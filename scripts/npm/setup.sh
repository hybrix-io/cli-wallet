#!/bin/sh
OLDPATH="$PATH"
WHEREAMI="`pwd`"
NODEINST="`which node`"

# $HYBRIDD/interface/scripts/npm  => $HYBRIDD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIDD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

INTERFACE="$HYBRIDD/interface"
NODE="$HYBRIDD/node"
DETERMINISTIC="$HYBRIDD/deterministic"
NODEJS="$HYBRIDD/nodejs"
COMMON="$HYBRIDD/common"
CLI_WALLET="$HYBRIDD/cli-wallet"

if [ "`uname`" = "Darwin" ]; then
    SYSTEM="darwin-x64"
elif [ "`uname -m`" = "i386" ] || [ "`uname -m`" = "i686" ]; then
    SYSTEM="x86"
elif [ "`uname -m`" = "x86_64" ]; then
    SYSTEM="x86_64"
else
    echo "[!] Unknown Architecture (or incomplete implementation)"
    exit 1;
fi



# NODE
if [ ! -e "$CLI_WALLET/node_binaries" ];then

    echo " [!] cli-wallet/node_binaries not found."

    if [ ! -e "$NODEJS" ];then
        cd "$HYBRIDD"
        echo " [i] Clone node js runtimes files"
        git clone https://gitlab.com/iochq/hybridd/dependencies/nodejs.git
    fi
    echo " [i] Link NODEJS files"
    ln -sf "$NODEJS/$SYSTEM" "$CLI_WALLET/node_binaries"
fi
export PATH="$CLI_WALLET/node_binaries/bin:$PATH"


# COMMON
if [ ! -e "$CLI_WALLET/common" ];then

    echo " [!] cli-wallet/common not found."

    if [ ! -e "$COMMON" ];then
        cd "$HYBRIDD"
        echo " [i] Clone common files"
        git clone https://www.gitlab.com/iochq/hybridd/common.git
    fi
    echo " [i] Link common files"
    ln -sf "$COMMON" "$CLI_WALLET/common"

fi

#if [ ! -e "$CLI_WALLET/lib/interface.js" ];then
#    ln -sf "$INTERFACE/lib/interface.js" "$CLI_WALLET/lib/interface.js"
#fi

#if [ ! -e "$CLI_WALLET/lib/hybridNode.js" ];then
#    ln -sf "$INTERFACE/lib/hybridNode.js" "$CLI_WALLET/lib/hybridNode.js"
#fi

# INTERFACE
if [ ! -e "$CLI_WALLET/interface" ];then

    echo " [!] cli-wallet/interface not found."

    if [ ! -e "$INTERFACE" ];then
        cd "$HYBRIDD"
        echo " [i] Clone interface files"
        git clone https://www.gitlab.com/iochq/hybridd/interface.git
    fi
    echo " [i] Link interface files"
    ln -sf "$INTERFACE/dist" "$CLI_WALLET/interface"
fi


export PATH="$OLDPATH"
cd "$WHEREAMI"
