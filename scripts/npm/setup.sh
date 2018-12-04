#!/bin/sh
OLDPATH="$PATH"
WHEREAMI="`pwd`"
NODEINST="`which node`"

# $HYBRIXD/interface/scripts/npm  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

INTERFACE="$HYBRIXD/interface"
NODE="$HYBRIXD/node"
DETERMINISTIC="$HYBRIXD/deterministic"
NODEJS="$HYBRIXD/nodejs"
COMMON="$HYBRIXD/common"
CLI_WALLET="$HYBRIXD/cli-wallet"

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
        cd "$HYBRIXD"
        echo " [i] Clone node js runtimes files"
        git clone https://gitlab.com/iochq/hybrixd/dependencies/nodejs.git
    fi
    echo " [i] Link NODEJS files"
    ln -sf "$NODEJS/$SYSTEM" "$CLI_WALLET/node_binaries"
fi
export PATH="$CLI_WALLET/node_binaries/bin:$PATH"


# COMMON
if [ ! -e "$CLI_WALLET/common" ];then

    echo " [!] cli-wallet/common not found."

    if [ ! -e "$COMMON" ];then
        cd "$HYBRIXD"
        echo " [i] Clone common files"
        git clone https://www.gitlab.com/iochq/hybrixd/common.git
    fi
    echo " [i] Link common files"
    ln -sf "$COMMON" "$CLI_WALLET/common"

fi

#if [ ! -e "$CLI_WALLET/lib/interface.js" ];then
#    ln -sf "$INTERFACE/lib/interface.js" "$CLI_WALLET/lib/interface.js"
#fi

#if [ ! -e "$CLI_WALLET/lib/hybrixNode.js" ];then
#    ln -sf "$INTERFACE/lib/hybrixNode.js" "$CLI_WALLET/lib/hybrixNode.js"
#fi

# INTERFACE
if [ ! -e "$CLI_WALLET/interface" ];then

    echo " [!] cli-wallet/interface not found."

    if [ ! -e "$INTERFACE" ];then
        cd "$HYBRIXD"
        echo " [i] Clone interface files"
        git clone https://www.gitlab.com/iochq/hybrixd/interface.git
    fi
    echo " [i] Link interface files"
    ln -sf "$INTERFACE/dist" "$CLI_WALLET/interface"
fi


export PATH="$OLDPATH"
cd "$WHEREAMI"
