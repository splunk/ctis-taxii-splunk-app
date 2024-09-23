#!/usr/bin/env bash
nodemon -e js,jsx,html,css --watch 'packages/my-splunk-app/src'  --watch 'packages/my-react-component/src'  --exec "./full-build.sh && ./splunk-bump.sh"
