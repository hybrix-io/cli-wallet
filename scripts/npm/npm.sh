#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/node_binaries/bin:"$PATH"
NPMINST=`which npm`

node $WHEREAMI/node_binaries/bin/npm $@

export PATH="$OLDPATH"
cd "$WHEREAMI"
