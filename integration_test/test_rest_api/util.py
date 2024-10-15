import json
import uuid

SPLUNK_ADMIN_URL = 'https://localhost:8099'
CTIS_APP_NAME = 'TA_CTIS_TAXII'
"""
List of test scenarios:
- create 2 new groupings, then:
    - list groupings
    - query groupings with filter by property?
    - cleanup groupings
- create new indicator, then:
    - list indicators
    - query indicators with filter by property?
    - cleanup indicators
- create 2 new indicators, then:
    - list indicators
    - query indicators with filter by property?
    - cleanup
- suggest STIX pattern for:
    - a known splunk field
    - an unknown splunk field -> non-200 response

"""

DEFAULT_REQUEST_PARAMS = {
    "output_mode": "json"
}


def get_indicators_collection(session) -> list:
    return get_collection(session, "indicators")

def get_identities_collection(session) -> list:
    return get_collection(session, "identities")

def get_groupings_collection(session) -> list:
    return get_collection(session, "groupings")


def get_collection(session, collection_name: str) -> list:
    # Handle pagination, limits.conf: max_rows_per_query = 50000
    records = []
    offset = 0
    page_size = 20000
    while True:
        resp = session.get(f'{SPLUNK_ADMIN_URL}/servicesNS/nobody/{CTIS_APP_NAME}/storage/collections/data/{collection_name}',
                           params={**DEFAULT_REQUEST_PARAMS, "limit": page_size, "skip": offset})
        resp.raise_for_status()
        j = resp.json()
        assert type(j) == list
        if len(j) == 0:
            break
        records.extend(j)
        offset += page_size
    return records


def clear_collection(session, collection_name: str):
    resp = session.delete(f'{SPLUNK_ADMIN_URL}/servicesNS/nobody/{CTIS_APP_NAME}/storage/collections/data/{collection_name}',
                          params=DEFAULT_REQUEST_PARAMS)
    resp.raise_for_status()

def clear_indicators_collection(session):
    clear_collection(session, "indicators")

def clear_identities_collection(session):
    clear_collection(session, "identities")

def clear_groupings_collection(session):
    clear_collection(session, "groupings")

def bulk_insert_indicators(session, indicators: list):
    # do it in batches of 1000
    batches = [indicators[i:i + 1000] for i in range(0, len(indicators), 1000)]
    for batch in batches:
        resp = session.post(
            f'{SPLUNK_ADMIN_URL}/servicesNS/nobody/{CTIS_APP_NAME}/storage/collections/data/indicators/batch_save',
            params=DEFAULT_REQUEST_PARAMS, json=batch)
        resp.raise_for_status()


def delete_endpoint(endpoint:str, session, payload: dict) -> dict:
    resp = session.delete(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/{endpoint}',
                        params=DEFAULT_REQUEST_PARAMS, json=payload)
    resp.raise_for_status()
    return resp.json()

def post_endpoint(endpoint:str, session, payload: dict) -> dict:
    resp = session.post(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/{endpoint}',
                        params=DEFAULT_REQUEST_PARAMS, json=payload)
    resp.raise_for_status()
    return resp.json()

def get_endpoint(endpoint:str, session, **query_params) -> dict:
    resp = session.get(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/{endpoint}',
                        params={**DEFAULT_REQUEST_PARAMS, **query_params})
    resp.raise_for_status()
    return resp.json()

def create_new_indicator(session, payload: dict) -> dict:
    return post_endpoint(endpoint="create-indicator", session=session, payload=payload)

def create_new_identity(session, payload: dict) -> dict:
    return post_endpoint(endpoint="create-identity", session=session, payload=payload)

def create_new_grouping(session, payload: dict) -> dict:
    return post_endpoint(endpoint="create-grouping", session=session, payload=payload)

def edit_identity(session, payload: dict) -> dict:
    return post_endpoint(endpoint="edit-identity", session=session, payload=payload)

def edit_grouping(session, payload: dict) -> dict:
    return post_endpoint(endpoint="edit-grouping", session=session, payload=payload)

def edit_indicator(session, payload: dict) -> dict:
    return post_endpoint(endpoint="edit-indicator", session=session, payload=payload)

def delete_identity(session, identity_id: str) -> dict:
    return delete_endpoint(endpoint="delete-identity", session=session, payload={
        "identity_id": identity_id
    })

def delete_grouping(session, grouping_id: str) -> dict:
    return delete_endpoint(endpoint="delete-grouping", session=session, payload={
        "grouping_id": grouping_id
    })

def delete_indicator(session, indicator_id: str) -> dict:
    return delete_endpoint(endpoint="delete-indicator", session=session, payload={
        "indicator_id": indicator_id
    })

def query_collection_endpoint(endpoint:str, session, skip:int, limit:int, query: dict = None) -> dict:
    query_params = {**DEFAULT_REQUEST_PARAMS, "skip": skip, "limit": limit}
    if query is not None:
        query_params["query"] = json.dumps(query)
    resp = session.get(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/{endpoint}',
                       params=query_params)
    resp.raise_for_status()
    return resp.json()


def list_indicators(session, skip: int, limit: int, query: dict = None) -> dict:
    return query_collection_endpoint(endpoint="list-indicators", session=session, skip=skip, limit=limit, query=query)

def list_identities(session, skip: int, limit: int, query: dict = None) -> dict:
    return query_collection_endpoint(endpoint="list-identities", session=session, skip=skip, limit=limit, query=query)

def list_groupings(session, skip: int, limit: int, query: dict = None) -> dict:
    return query_collection_endpoint(endpoint="list-groupings", session=session, skip=skip, limit=limit, query=query)

def create_indicator_form_payload(grouping_id:str, indicators: list) -> dict:
    return {
        "grouping_id": grouping_id,
        "confidence": 100,
        "tlp_v2_rating": "TLP:GREEN",
        "valid_from": "2024-09-03T22:51:44.361",
        "indicators": indicators
    }

def example_indicator() -> dict:
    return {
        "splunk_field_name": "src_ip",
        "indicator_value": "123.456.1.2",
        "indicator_category": "source_ipv4",
        "stix_pattern": "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '123.456.1.2']",
        "name": "Source IPv4",
        "description": "Source IPv4 - Description",
    }

def new_indicator_payload() -> dict:
    return {
        "splunk_field_name": "dest_ip",
        "indicator_value": "1.2.3.4",
        "indicator_category": "destination_ipv4",
        "grouping_id": f"grouping--{uuid.uuid4()}",
        "name": "Name",
        "description": "Description",
        "stix_pattern": "[network-traffic:dst_ref.type = 'ipv4-addr' AND network-traffic:dst_ref.value = '127.0.0.1']",
        "tlp_v2_rating": "TLP:WHITE",
        "valid_from": "2024-08-16T23:00:22",
        "confidence": 50
    }
