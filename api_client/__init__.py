import requests
import os

splunk_username = os.environ['SPLUNK_USERNAME']
splunk_password = os.environ['SPLUNK_PASSWORD']


def create_indicator():
    payload = {
        "splunk_field_name": "dest_ip",
        "splunk_field_value": "1.2.3.4",
        "grouping_id": "grouping--aaa646ef-0ed0-4d7b-8898-b78a25ef0ce8",
        "name": "Name",
        "description": "Description",
        "stix_pattern": "[network-traffic:dst_ref.type = 'ipv4-addr' AND network-traffic:dst_ref.value = '127.0.0.1']",
        "tlp_v1_rating": "WHITE",
        "valid_from": "2024-08-16T23:00:22",
        "confidence": 50
    }
    resp = requests.post('https://localhost:8089/servicesNS/-/TA_CTIS_TAXII/create-indicator?output_mode=json',
                         auth=(splunk_username, splunk_password), verify=False,
                         json=payload)
    resp.raise_for_status()


if __name__ == '__main__':
    for i in range(1000):
        if i % 10 == 0:
            print(i)
        create_indicator()
