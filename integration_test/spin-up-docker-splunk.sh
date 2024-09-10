#!/usr/bin/env bash
set -e

# Assume this script is run from inside integration_test directory
# TODO: check this?

# Build UCC app
cd ..
./full-build.sh
cd -

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

SPLUNK_PASSWORD='helloWorld1!'
# Run splunk docker with the app installed
# Web port exposed on localhost:8002
# Admin port exposed on localhost:8099
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker run -d --rm --name splunk-ctis --hostname splunk-ctis \
  -p 8002:8000 \
  -p 8099:8089 \
  -e "SPLUNK_PASSWORD=$SPLUNK_PASSWORD" \
  -e 'SPLUNK_START_ARGS=--accept-license' \
  -v "$(pwd):/tmp/test" \
  -e 'SPLUNK_APPS_URL=/tmp/test/ctis.tar.gz' \
  -it splunk/splunk:latest


function checkIfSplunkIsUp() {
    if curl -k -u "admin:$SPLUNK_PASSWORD" 'https://localhost:8099/services/apps/local?output_mode=json' 2> /dev/null | jq ".entry[].name" | grep TA_CTIS_TAXII; then
        echo "App is installed"
        return 0
    else
        echo "App is not installed"
        return 1
    fi
}

# Wait for splunk to be up
echo "Time is now $(date)"
printf "Waiting for Splunk to be up..."
# TODO: wait for app to be installed and ready, because the docker image initially starts with no apps installed
NUM_ATTEMPTS=10
while true; do
    for i in $(seq 1 $NUM_ATTEMPTS); do
        if checkIfSplunkIsUp; then
            echo
            date
            echo "Splunk is up and app is installed (Attempt $i)"
            sleep 1
        else
            echo "Splunk is not up yet."
            break
        fi
    done
    if [ "$i" -eq "$NUM_ATTEMPTS" ]; then
        echo "Splunk is confirmed up after $i attempts"
        break
    fi
    sleep 5
done
