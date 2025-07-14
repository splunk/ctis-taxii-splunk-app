# Indicators
## Creating Indicators
Reference: [STIX Indicator SDO](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_muftrcpnf89v)

- Via workflow action (context menu) on a Splunk event
    - https://docs.splunk.com/Documentation/Splunk/latest/Knowledge/Controlworkflowactionappearanceinfieldandeventmenus
    - Both event-level and field-level workflow actions are supported.
    - Document how this looks in ES (across all supported versions)
- Via the New Indicator page

## STIX Patterns

Note that specifying unicode characters with `\uXXXX` syntax is not supported in the app.
You can however, paste the unicode character you require in the indicator value field or modify the STIX Pattern directly.

For any non human-readable characters such as <https://unicode-explorer.com/c/200B>, it is recommended to note these in the `description` field of the Indicator.

## Viewing / Searching Indicators

