# Curating and Sharing CTI
This guide covers how to use the app to curate IoCs (Indicators of Compromise) for cyber threat intelligence (CTI) sharing,
and how to submit groupings of IoCs to a TAXII v2 server as a STIX v2 Bundle.

It is assumed that the app has been [installed](../installation.md) and [configured](../configuration.md) already.

The app provides a UI for creating and managing records that represent Identity, Grouping and Indicator SDOs (STIX Domain Objects)
within your Splunk environment. These records are stored in KV Store collections belonging to the app.

A grouping consists of one or more related indicators.
When ready to be shared with the desired TAXII server, the grouping can be submitted as a [STIX Bundle](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_gms872kuzdmg),
which contains the grouping and related objects.

This app supports a subset of the STIX v2.1 specification for the aforementioned SDOs, which has been coordinated with the CTIS program.
If you believe a particular feature or use-case is missing, please raise a [feature request](../index.md#support).


## Quick Start
To get started with curating and sharing CTI using this app, follow these steps:

1. [Create an Identity](identities.md) to represent the author of the CTI contribution.
2. [Create a Grouping](groupings.md) to represent a collection of related Indicators.
3. [Add new Indicators](indicators.md) to the Grouping.
4. [Submit the Grouping](submissions.md) to a TAXII server as a STIX Bundle.

## About TLP 2.0 Markings
Traffic Light Protocol (TLP) 2.0 markings are used to mark the information sensitivity of SDOs managed by this app.

See <https://www.first.org/tlp/> for more information on TLP 2.0 markings and their definitions.

[FIRST](https://www.first.org/tlp/) defines TLP as:
> The Traffic Light Protocol (TLP) was created to facilitate greater sharing of potentially sensitive information and more effective collaboration.
> Information sharing happens from an information source, towards one or more recipients.
> TLP is a set of four labels used to indicate the sharing boundaries to be applied by the recipients.

The defined TLP 2.0 labels are:

- TLP:RED
- TLP:AMBER
- TLP:AMBER+STRICT
- TLP:GREEN
- TLP:CLEAR

A STIX Extension definition for TLP 2.0 is used to represent the TLP markings.

See the oasis-open definitions here: <https://github.com/oasis-open/cti-stix-common-objects/tree/main/extension-definition-specifications/tlp-2.0/examples>
