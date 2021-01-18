#!/bin/sh
OLDPATH=$PATH
WHEREAMI=$(pwd)

export PATH=$WHEREAMI/node_binaries/bin:"$PATH"

echo "[.] Build"

sh ./scripts/pipeline/setup.sh
sh ./scripts/npm/compile.sh
sh ./scripts/pipeline/clean.sh

echo "[.] Dist"

echo "[i] Install zip"
apt-get -qq update
apt-get -qq install -y zip

echo "[i] Install sshpass"
apt-get -qq install -y sshpass;

VERSION="v"$(cat package.json | grep version | cut -d'"' -f4)
echo "[i] Version $VERSION"

mkdir -p /dist

FILE_NAME="hybrix.cli-wallet.$VERSION"
LATEST_FILE_NAME="hybrix.cli-wallet.latest"
mkdir -p /hybrixd


echo "[.] Create packed distributables"

zip -rq "/dist/${FILE_NAME}.zip" .
tar -zcf "/dist/${FILE_NAME}.tar.gz" .

echo "[.] Copying to latest folder"
rsync -ra --rsh="$RELEASE_OPTIONS" "/dist/${FILE_NAME}.zip" "$RELEASE_TARGET/cli-wallet/latest/$LATEST_FILE_NAME.zip"
rsync -ra --rsh="$RELEASE_OPTIONS" "/dist/${FILE_NAME}.tar.gz" "$RELEASE_TARGET/cli-wallet/latest/$LATEST_FILE_NAME.tar.gz"

echo "[.] Copying to version folder"
rsync -ra --rsh="$RELEASE_OPTIONS" "/dist/${FILE_NAME}.zip" "$RELEASE_TARGET/cli-wallet/$VERSION/$FILE_NAME.zip"
rsync -ra --rsh="$RELEASE_OPTIONS" "/dist/${FILE_NAME}.tar.gz" "$RELEASE_TARGET/cli-wallet/$VERSION/$FILE_NAME.tar.gz"

export PATH="$OLDPATH"
cd "$WHEREAMI"
