"""
TODO:
- Create fixture to spin up and tear down the TAXII server using the script provided.
- Given Splunk host and credentials, and that the CTIS app is installed....
- Create a new TAXII config in the app via a POST request:

POST https://localhost:8089/servicesNS/-/TA_CTIS_TAXII/TA_CTIS_TAXII_taxii_config?output_mode=json
Using x-www-form-urlencoded body with fields:
name, api_root_url, username, password.

- Create an identity
- Create a grouping
- Create an indicator which references the identity and grouping created
- Get preview of STIX bundle JSON for grouping via API
- Submit STIX bundle to TAXII server via API
"""

class TestTaxiiServerConnection:
    def test_taxii_server_discovery(self, taxii2_server, taxii2_server_session):
        resp = taxii2_server_session.get(taxii2_server.server_discovery_url)
        resp.raise_for_status()
        print(resp.json())


    def test_list_collections_for_default_api_root(self, taxii2_server, taxii2_server_session):
        resp = taxii2_server_session.get(f"{taxii2_server.default_api_root_url}/collections")
        resp.raise_for_status()
        print(resp.json())
