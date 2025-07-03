# Installation
As this app is not distributed via Splunkbase, it is considered a **private app**.

This app should generally be installed on the Search Head(s) of your Splunk environment.

Please follow the relevant installation instructions below depending on your Splunk environment.

## Download
Download the latest **App Build** from <https://github.com/splunk/ctis-taxii-splunk-app/releases/latest> 

## Requirements
This Splunk app is compatible with:

- Splunk Enterprise 9.2 or later
- Splunk Cloud 9.2 or later




## Install on Splunk Enterprise - Standalone Instance / Single Search Head

Choose to install the app via either Splunk Web or the Command Line Interface (CLI).

### Splunk Web
1. From the Splunk Web home screen, click the gear icon next to Apps.
2. Click Install app from file.
3. Locate the downloaded app file (.tar.gz) and click Upload.
4. If Splunk Enterprise prompts you to restart, do so.
5. Verify that the add-on appears in the list of apps and add-ons.

### Command Line (CLI)
```
# From $SPLUNK_HOME/bin
./splunk install app <path_to_app.tar.gz>
```
See the [Splunk CLI documentation](https://help.splunk.com/en/splunk-enterprise/administer/admin-manual/9.4/administer-splunk-enterprise-with-the-command-line-interface-cli/administrative-cli-commands) for more information.

## Install on Splunk Enterprise - Search Head Cluster
Use the deployer to distribute the app to all Search Heads in the cluster.

As this app contains configuration of KV Store collections, a rolling restart of the Search Heads is required after deploying the app.

See the admin documentation [Use the deployer to distribute apps and configuration updates](https://help.splunk.com/en/splunk-enterprise/administer/distributed-search/9.4/update-search-head-cluster-members/use-the-deployer-to-distribute-apps-and-configuration-updates) for more information.

Note that, the default `deployer_push_mode` of `merge_to_default` is likely to be sufficient, but this will depend on your environment and how you manage this app.

For more information, see the documentation: [Choose a deployer push mode](https://help.splunk.com/en/splunk-enterprise/administer/distributed-search/9.4/update-search-head-cluster-members/use-the-deployer-to-distribute-apps-and-configuration-updates#ariaid-title5)

## Install on Splunk Cloud

See the Splunk Cloud documentation for installing private apps:

- [Install a private app on Victoria Experience](https://help.splunk.com/en/splunk-cloud-platform/administer/admin-manual/9.3.2411/manage-apps-and-add-ons-in-splunk-cloud-platform/manage-private-apps-on-your-splunk-cloud-platform-deployment#ariaid-title4)
- [Install a private app on Classic Experience](https://help.splunk.com/en/splunk-cloud-platform/administer/admin-manual/9.3.2411/manage-apps-and-add-ons-in-splunk-cloud-platform/manage-private-apps-on-your-splunk-cloud-platform-deployment#ariaid-title6)


## Uninstall
TODO

### Export Data
...

### Remove the App
...



