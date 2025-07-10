#!/usr/bin/env bash
# Rebuild entire Splunk app if any frontend changes are made
# Note that for backend changes (e.g. REST endpoints), you will need to restart the Splunk server manually.
nodemon -e js,jsx,html,css --watch 'packages/my-splunk-app/src'  --watch 'packages/my-react-component/src'  --exec "./full-build.sh && ./splunk-bump.sh"
