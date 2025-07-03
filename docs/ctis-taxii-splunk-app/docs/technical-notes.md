# Technical Notes

## Configuration files (.conf)
This app reads/writes the following configuration files:

- passwords.conf
- ta_ctis_taxii_taxii_config.conf

They would usually be located in the app's `local` directory.

The app's Configuration page, where you can create/update/delete your TAXII configuration details, calls REST endpoints which read/write these configuration files.

Passwords are encrypted using the method described [here](https://dev.splunk.com/enterprise/docs/developapps/manageknowledge/secretstorage/), where
the `POST storage/passwords` Splunk REST API endpoint is used.

### Search Head Cluster Environments
For a Search Head Cluster environment, changes to these configuration files on one search head should automatically propagate to all search heads in the cluster.

`splunk.secret` should be consistent across SHC members, which is the default behaviour, as discussed in [Deploy secure passwords across multiple servers:](https://help.splunk.com/en/splunk-enterprise/administer/manage-users-and-security/9.4/install-splunk-enterprise-securely/deploy-secure-passwords-across-multiple-servers)

> In a search head cluster, the search head cluster captain replicates its splunk.secret file to all other cluster members during initial deployment of the cluster.
> You do not need to copy the file manually. As part of its normal operation, the cluster also automatically replicates any credentials that are stored by apps for their own use.

## KV Store Collections

This app defines the following KV Store collections in the `default/collections.conf` file:

- identities
- indicators
- groupings
- submissions

## Scheduled Searches

A saved search called `ctis_taxii_scheduler` is scheduled to run every minute to handle scheduled submissions of Groupings to the configured TAXII server.

This can be adjusted as needed via the Splunk Web UI or by editing the app's `local/savedsearches.conf` file.

## Python Packages
This app uses the following Python packages:

- [stix2](https://pypi.org/project/stix2/)
- [stix2-patterns](https://pypi.org/project/stix2-patterns/)
- [taxii2-client](https://pypi.org/project/taxii2-client/)