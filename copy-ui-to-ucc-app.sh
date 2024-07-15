#!/usr/bin/env bash
# copy all of my-splunk-app/stage/appserver to TA_CTIS_TAXII_ES_AR/package/appserver
rsync -avh --progress packages/my-splunk-app/stage/appserver/ TA_CTIS_TAXII_ES_AR/package/appserver
# copy my-splunk-app/stage/default/data/ui/views to TA_CTIS_TAXII_ES_AR/package/default/data/ui/views
rsync -avh --progress packages/my-splunk-app/stage/default/data/ui/views/ TA_CTIS_TAXII_ES_AR/package/default/data/ui/views
