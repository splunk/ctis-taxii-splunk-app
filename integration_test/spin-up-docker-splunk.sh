#!/usr/bin/env bash
set -e

# Check the env var SPLUNK_APP_FILENAME is set
if [ -z "$SPLUNK_APP_FILENAME" ]; then
    echo "Please set the SPLUNK_APP_FILENAME environment variable"
    exit 1
fi
# Check the env var SPLUNK_PASSWORD is set
if [ -z "$SPLUNK_PASSWORD" ]; then
    echo "Please set the SPLUNK_PASSWORD environment variable"
    exit 1
fi

splunk_version="${SPLUNK_VERSION:-latest}"
echo "Will spin up Splunk docker with SPLUNK_VERSION: $splunk_version"

YELLOW='\033[1;33m'
NC='\033[0m' # No Color

printf "${YELLOW}WARNING: Make sure to package and build the app before running this script!\n${NC}"
echo "Make sure to check the timestamp of the app file"
ls -l "$SPLUNK_APP_FILENAME"

APP_NAME='TA_CTIS_TAXII'

# Stop & Remove existing splunk-ctis container
container_name="splunk-ctis"
docker ps -q --filter "name=$container_name" | xargs -r docker stop
sleep 2
docker ps -aq --filter "name=$container_name" | xargs -r docker rm

# Check if OS is Darwin
if uname -a | grep -q "Darwin"; then
    # If OS is Darwin, then we need to use the default platform for docker
    echo "OS is Darwin, setting DOCKER_DEFAULT_PLATFORM to linux/amd64"
    export DOCKER_DEFAULT_PLATFORM=linux/amd64
fi


# Run splunk docker with the app installed
# Web port exposed on localhost:8002
# Admin port exposed on localhost:8099
docker run -d --rm --name splunk-ctis --hostname splunk-ctis \
  -p 8002:8000 \
  -p 8099:8089 \
  -p 4444:4444 \
  -e "SPLUNK_PASSWORD=$SPLUNK_PASSWORD" \
  -e 'SPLUNK_START_ARGS=--accept-license' \
  -v "$(pwd):/tmp/test" \
  -e "SPLUNK_APPS_URL=/tmp/test/$SPLUNK_APP_FILENAME" \
  -it splunk/splunk:"$splunk_version"


function checkIfSplunkIsUp() {
    if curl -k -u "admin:$SPLUNK_PASSWORD" 'https://localhost:8099/services/apps/local?output_mode=json' 2> /dev/null | jq ".entry[].name" | grep "$APP_NAME"; then
        echo "App is installed"
        return 0
    else
        echo "App is not installed"
        return 1
    fi
}

function checkApiEndpoint() {
    echo "Hitting List Submissions API endpoint"
    resp=$(curl -w '\n%{http_code}' -k -u "admin:$SPLUNK_PASSWORD" "https://localhost:8099/servicesNS/-/$APP_NAME/list-submissions?output_mode=json")
    echo "Response: $resp"
    resp_code=$(echo "$resp" | tail -n1)
    echo "Response code: $resp_code"
    if [ "$resp_code" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Wait for splunk to be up
echo "Time is now $(date)"
printf "Waiting for Splunk to be up..."
# TODO: wait for app to be installed and ready, because the docker image initially starts with no apps installed
NUM_ATTEMPTS=5
while true; do
    for i in $(seq 1 $NUM_ATTEMPTS); do
        if checkIfSplunkIsUp; then
            echo
            date
            echo "Splunk is up and app is installed (Attempt $i)"
            sleep 3
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

# Wait for one of our app's API endpoints to reachable
# TODO: We might not need to check for the app installation above if we can just check for the API endpoint
while true; do
    if checkApiEndpoint; then
        echo "API endpoint is up"
        break
    else
        echo "API endpoint is not up yet."
        sleep 5
    fi
done
