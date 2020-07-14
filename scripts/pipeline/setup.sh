#!/bin/sh
OLDPATH=$PATH
WHEREAMI=$(pwd)

export PATH=$WHEREAMI/node_binaries/bin:"$PATH"

echo "[.] Install jsdoc"

npm install -g jsdoc

echo "[.] Get common"
curl --location --header "PRIVATE-TOKEN:$HYBRIX_BOT_GITLAB_PIPELINE_TOKEN" "https://gitlab.com/api/v4/projects/hybrix%2Fhybrixd%2Fcommon/jobs/artifacts/master/download?job=common" -o artifacts-common.zip

# remove link to common and unzip the downloaded artifact to the directory (|| true --> on error, no problem)
rm -rf  common || true
unzip -q -o artifacts-common.zip -d common

# remove the zip-file (|| true --> on error, no problem)
rm -rf  artifacts-common.zip || true

echo "[.] Get interface"
curl --location --header "PRIVATE-TOKEN:$HYBRIX_BOT_GITLAB_PIPELINE_TOKEN" "https://gitlab.com/api/v4/projects/hybrix%2Fhybrixd%2Finterface/jobs/artifacts/master/download?job=interface" -o artifacts-interface.zip

# remove link to interface and unzip the downloaded artifact to the directory (|| true --> on error, no problem)
rm -rf  interface || true
unzip -q -o artifacts-interface.zip -d interface

# remove the zip-file (|| true --> on error, no problem)
rm -rf  artifacts-interface.zip || true

export PATH="$OLDPATH"
cd "$WHEREAMI"
