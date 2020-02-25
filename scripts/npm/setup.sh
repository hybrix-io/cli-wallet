#!/bin/sh
OLDPATH="$PATH"
WHEREAMI="`pwd`"

# $HYBRIXD/interface/scripts/npm  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

COMMON="$HYBRIXD/common"
NODEJS="$HYBRIXD/nodejs"
CLI_WALLET="$HYBRIXD/cli-wallet"

if [ -e "$HYBRIXD/hybrixd" ]; then
    ENVIRONMENT="public"
    echo "[i] Environment is public..."
elif [ -e "$HYBRIXD/node" ]; then
    ENVIRONMENT="dev"
    echo "[i] Environment is development..."
else
    echo "[i] Could not determine environment"
    read -p " [?] Please enter environment [dev/public] " ENVIRONMENT
fi

if [ "$ENVIRONMENT" = "public" ]; then
    URL_COMMON="https://github.com/hybrix-io/common.git"
    URL_NODEJS="https://github.com/hybrix-io/nodejs.git"
    URL_INTERFACE="https://github.com/hybrix-io/hybrix-jslib.git"
elif [ "$ENVIRONMENT" = "dev" ]; then
    URL_COMMON="https://gitlab.com/hybrix/hybrixd/common.git"
    URL_NODEJS="https://www.gitlab.com/hybrix/hybrixd/dependencies/nodejs.git"
    URL_INTERFACE="https://gitlab.com/hybrix/hybrixd/interfacee.git"
else
    echo "[!] Illegal environment \"$ENVIRONMENT\". Expected \"dev\" or \"public\""
    export PATH="$OLDPATH"
    cd "$WHEREAMI"
    exit 1
fi

if [ "`uname`" = "Darwin" ]; then
    SYSTEM="darwin-x64"
elif [ "`uname -m`" = "i386" ] || [ "`uname -m`" = "i686" ] || [ "`uname -m`" = "x86_64" ]; then
    SYSTEM="linux-x64"
else
    echo "[!] Unknown Architecture (or incomplete implementation)"
    export PATH="$OLDPATH"
    cd "$WHEREAMI"
    exit 1;
fi

# NODE_BINARIEES
if [ ! -e "$CLI_WALLET/node_binaries" ];then

    echo " [!] cli-wallet/node_binaries not found."

    if [ ! -e "$NODEJS" ];then
        cd "$HYBRIXD"
        echo " [i] Clone node js runtimes files"
        git clone "$URL_NODEJS"
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
        git clone "$URL_COMMON"
    fi
    echo " [i] Link common files"
    ln -sf "$COMMON" "$CLI_WALLET/common"

fi

# INTERFACE
if [ ! -e "$CLI_WALLET/interface" ];then

    echo " [!] cli-wallet/interface not found."

    if [ ! -e "$INTERFACE" ];then
        cd "$HYBRIXD"
        echo " [i] Clone interface files"
        git clone "$URL_INTERFACE"
    fi
    echo " [i] Link interface files"
    ln -sf "$INTERFACE/dist" "$CLI_WALLET/interface"

    if [ "$ENVIRONMENT" = "public" ];then
        echo " [i] Link hybrix-jslib to interface"
        ln -sf "$HYBRIXD/hybrix-jslib" "$HYBRIXD/interface"
    fi
fi

# GIT HOOKS
sh "$COMMON/hooks/hooks.sh" "$CLI_WALLET"

export PATH="$OLDPATH"
cd "$WHEREAMI"
