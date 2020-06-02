#!/bin/sh
OLDPATH=$PATH
WHEREAMI=$(pwd)

export PATH=$WHEREAMI/node_binaries/bin:"$PATH"

echo "[.] Clean up"
# remove all but dist
mkdir /tmp/dist
mv ./dist/* /tmp/dist/
rm -rf ./* || true
rm -rf .* || true

# clean up and prepare the artifacts (instead of having a dist)
mv /tmp/dist/* ./

export PATH="$OLDPATH"
cd "$WHEREAMI"
