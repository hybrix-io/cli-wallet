#!/bin/sh
OLDPATH="$PATH"
WHEREAMI="`pwd`"
export PATH="$WHEREAMI/node_binaries/bin:$PATH"
NODEINST="`which node`"
UGLIFY=node_modules/uglify-es/bin/uglifyjs
CSSMIN=node_modules/cssmin/bin/cssmin

# $HYBRIXD/node/scripts/npm  => $HYBRIXD
SCRIPTDIR="`dirname \"$0\"`"
HYBRIXD="`cd \"$SCRIPTDIR/../../..\" && pwd`"

CLI_WALLET="$HYBRIXD/cli-wallet"
INTERFACE="$HYBRIXD/interface"
DIST="$CLI_WALLET/dist"

echo "[.] Creating cli-wallet release..."

# Create path if required, clean otherwise
mkdir -p "$DIST/storage"
echo "[.] Cleaning target path"
rm -rfv "$DIST/*" >/dev/null

echo "[.] Processing files"
cd "$CLI_WALLET"

# Copy the main entrypoint
cp "$CLI_WALLET/cli-wallet" "$DIST/"
# Copy license
cp "$CLI_WALLET/LICENSE.md" "$DIST/"
# Copy readme
cp "$CLI_WALLET/README.md" "$DIST/"
# Copy package.json
cp "$CLI_WALLET/package.json" "$DIST/"

# Copy node_modules
cp -r "$CLI_WALLET/node_modules" "$DIST/"

# Copy the lib contents
cp -r "$CLI_WALLET/lib" "$DIST/"

# Copy the common directory
cp -r "$CLI_WALLET/common" "$DIST/"

# Copy the common directory
cp -r "$CLI_WALLET/interface" "$DIST/"

# Copy the docs
cp -r "$CLI_WALLET/docs" "$DIST/"

echo "[.] Release created in $DIST/"
echo "[.] Make sure you have proper node binaries."
export PATH="$OLDPATH"
cd "$WHEREAMI"
