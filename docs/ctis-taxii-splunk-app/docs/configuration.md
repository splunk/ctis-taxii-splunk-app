# Configuration

## Network Requirements
Note that TAXII v2 runs over HTTPS. The TAXII server must be reachable from the Splunk instance, so please consider both:

- Any firewalls which restrict outbound connections from your Splunk Search Head(s)
- The TAXII server must accept HTTPS traffic from your Splunk Search Head(s).
- If needed, please contact the ASD CTIS team (or TAXII Server owner) to whitelist your Splunk Search Head(s) IPv4 address(es).

## Configuring connection details for a TAXII Server

Start by configuring the TAXII server that will be used to submit STIX bundles.

Navigate to the **Configuration** tab in the app.

![Configuration Page](img/configuration_first_time.png)

Click on the **Add** button to add a new TAXII server configuration.
![Dialog to add TAXII server](img/configuration_add_dialog.png)

Clicking on **Add** will verify the connection to the TAXII server including network connectivity and authentication.


