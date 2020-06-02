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

VERSION="v"$(cat package.json | grep version | cut -d'"' -f4)
echo "[i] Version $VERSION"

mkdir -p /dist

COMPONENT="cli-wallet"
FILE_NAME="hybrixd.${COMPONENT}.$VERSION"
LATEST_FILE_NAME="hybrixd.${COMPONENT}.latest"
mkdir -p /hybrixd


echo "[.] Create packed distributables"

zip -rq "/dist/${FILE_NAME}.zip" .
tar -zcf "/dist/${FILE_NAME}.tar.gz" .

echo "[.] Create service account key (required for gsutil)"
echo "$SERVICE_ACCOUNT_KEY2" > /hybrixd/key.json

echo "[.] Copy boto file  (required for gsutil)"

echo "$BOTO_CONF" > ~/.boto

echo "[.] Copying to latest folder"

gsutil cp "/dist/${FILE_NAME}.zip" "gs://hybrix-dist/$COMPONENT/latest/$LATEST_FILE_NAME.zip"
gsutil cp "/dist/${FILE_NAME}.tar.gz" "gs://hybrix-dist/$COMPONENT/latest/$LATEST_FILE_NAME.tar.gz"

echo "[.] Copying to version folder"
gsutil cp "/dist/${FILE_NAME}.zip" "gs://hybrix-dist/$COMPONENT/$VERSION/$FILE_NAME.zip"
gsutil cp "/dist/${FILE_NAME}.tar.gz" "gs://hybrix-dist/$COMPONENT/$VERSION/$FILE_NAME.tar.gz"


export PATH="$OLDPATH"
cd "$WHEREAMI"
