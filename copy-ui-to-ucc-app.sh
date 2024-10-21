#!/usr/bin/env bash
set +xe
# copy all of my-splunk-app/stage/appserver to TA_CTIS_TAXII/package/appserver
rsync -avh --progress packages/my-splunk-app/stage/appserver/ TA_CTIS_TAXII/package/appserver
# copy my-splunk-app/stage/default/data/ui/views to TA_CTIS_TAXII/package/default/data/ui/views
rsync -avh --progress packages/my-splunk-app/stage/default/data/ui/views/ TA_CTIS_TAXII/package/default/data/ui/views

echo "Listing files in views"
ls -l TA_CTIS_TAXII/package/default/data/ui/views

echo "Listing files in templates"
ls -l TA_CTIS_TAXII/package/appserver/templates

# https://stackoverflow.com/a/43453459/23523267
# Uses GNU sed syntax. For MacOS, use: https://formulae.brew.sh/formula/gnu-sed
# replace 'my-splunk-app:' with 'TA_CTIS_TAXII:' in all xml views in TA_CTIS_TAXII/package/default/data/ui/views
echo "Replacing app name in views XML files..."
find TA_CTIS_TAXII/package/default/data/ui/views -type f -name "*.xml" -exec sed -i 's/my-splunk-app/TA_CTIS_TAXII/g' {} \;

echo "Replacing app name in template HTML files..."
find TA_CTIS_TAXII/package/appserver/templates -type f -name "*.html" -exec sed -i 's/my-splunk-app/TA_CTIS_TAXII/g' {} \;
