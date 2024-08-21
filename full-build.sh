#!/usr/bin/env bash
set -xe

# Build the SplunkUI app
yarn run build # From project root

# Copy the SplunkUI app files to the source of the UCC app
./copy-ui-to-ucc-app.sh

# If adding new views, manually edit TA_CTIS_TAXII/package/default/data/ui/nav/default.xml

# Rebuild the UCC app
cd TA_CTIS_TAXII # move into UCC app directory containing package dir
# instead of ucc-gen build, contains additional build steps
./ucc-build.sh
