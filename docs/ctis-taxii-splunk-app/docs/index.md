# CTIS TAXII Splunk App Documentation

This Splunk app provides threat intelligence sharing capabilities to integrate Splunk Platform with the ASD's Cyber Threat Intelligence Sharing (CTIS) platform.
This app enables cybersecurity teams to curate IoCs (Indicators of Compromise) from ingested Splunk events, which can be submitted as STIX v2.1 Bundles via the TAXII v2.1 protocol.

## Github Repository
<https://github.com/splunk/ctis-taxii-splunk-app>

## Supporting Documentation
- [Oasis Open - Introduction to STIX](https://oasis-open.github.io/cti-documentation/stix/intro.html)
- [Oasis Open - Introduction to TAXII](https://oasis-open.github.io/cti-documentation/taxii/intro.html)
- [TAXII v2.1 Specification](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html)
- [STIX v2.1 Specification](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html)
- [Australian Signals Directorate’s Cyber Security Partnership Program](https://www.cyber.gov.au/partnershipprogram)

## Getting Started
- For how to install this app in your Splunk environment, see: [Installation](installation.md)
- For how to configure the app with your desired TAXII server, see: [Configuration](configuration.md)
- For how to use the app, including curating IoCs for threat intelligence sharing, see: [Curating and Sharing CTI](cti-mgmt/index.md)

## Support
- This app is not Splunk Supported. Limited support is available from the developers on a best-effort basis.
- For questions regarding this app please contact `splunk-ctis-app@cisco.com`.
- For bug reports and feature requests, [raise an issue in the Github repository](https://github.com/splunk/ctis-taxii-splunk-app/issues/new/choose).