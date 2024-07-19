#!/usr/bin/env bash
# Bump push-version so cache is wiped for app web content

bump=`cat $SPLUNK_HOME/var/run/splunk/push-version.txt`
echo "Current version: $bump"
let bump++
echo -n $bump > $SPLUNK_HOME/var/run/splunk/push-version.txt
echo "New version:  $bump    (Restart splunkweb?)"
