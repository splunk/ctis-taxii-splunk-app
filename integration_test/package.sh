#!/usr/bin/env bash
set -e

basename_of_pwd=$(basename "$PWD")
if [ "$basename_of_pwd" != "integration_test" ]; then
  echo "This script must be run from inside the integration_test directory"
  exit 1
fi

# Build UCC app
cd ..
./full-build.sh
cd -

# Clean existing apps
echo "Cleaning existing apps"
rm -f ./*.tar.gz

# Package the UCC app
ucc-gen package --path ../TA_CTIS_TAXII/output/TA_CTIS_TAXII
path_to_app=$(find . -type f -name "TA_CTIS*.tar.gz")
num_apps=$(echo "$path_to_app" | wc -l | sed 's/^[[:space:]]*//g')
echo "Found $num_apps apps"
if [ "$num_apps" -ne 1 ]; then
  echo "Expected to find 1 app, found $num_apps"
  exit 1
fi

if [ -z "$APP_PACKAGE_FILENAME" ]; then
  echo "APP_PACKAGE_FILENAME is not set. Using default app package filename..."
  APP_PACKAGE_FILENAME="./ctis.tar.gz"
fi

echo "Renaming app to $APP_PACKAGE_FILENAME"
mv "$path_to_app" "$APP_PACKAGE_FILENAME"
