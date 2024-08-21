#!/usr/bin/env bash
set -e

# Assume this script is run from inside integration_test directory
# TODO: check this?

# Clean existing apps
echo "Cleaning existing apps"
rm ./*.tar.gz

# Package the UCC app
ucc-gen package --path ../TA_CTIS_TAXII/output/TA_CTIS_TAXII
path_to_app=$(find . -type f -name "TA_CTIS*.tar.gz")
num_apps=$(echo $path_to_app | wc -l | sed 's/^[[:space:]]*//g')
echo "Found $num_apps apps"
if [ $num_apps -ne 1 ]; then
  echo "Expected to find 1 app, found $num_apps"
  exit 1
fi

echo "Renaming app to ctis.tar.gz"
mv "$path_to_app" ./ctis.tar.gz

# Stop & Remove existing splunk-ctis container
container_name="splunk-ctis"
docker ps -q --filter "name=$container_name" | xargs -r docker stop
sleep 2
docker ps -aq --filter "name=$container_name" | xargs -r docker rm


# Run splunk docker with the app installed
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker run -d --rm --name splunk-ctis --hostname splunk-ctis \
  -p 8002:8000 \
  -p 8099:8089 \
  -e 'SPLUNK_PASSWORD=helloWorld1!' \
  -e 'SPLUNK_START_ARGS=--accept-license' \
  -v "$(pwd):/tmp/test" \
  -e 'SPLUNK_APPS_URL=/tmp/test/ctis.tar.gz' \
  -it splunk/splunk:latest

# Wait for splunk to be up
echo "Time is now $(date)"
while true; do
    if curl -f http://localhost:8002; then
        echo "$(date) Splunk is up"
        break
    fi
    echo "Waiting for splunk to be up..."
    sleep 3
done
