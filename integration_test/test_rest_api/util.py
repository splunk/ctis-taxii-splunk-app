import json
import random
import string
import uuid
import os
import logging
from typing import Optional, List, Dict

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

SPLUNK_ADMIN_URL = os.environ.get('SPLUNK_ADMIN_URL', 'https://localhost:8099')

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

def random_alnum_string(size=20, chars=string.ascii_lowercase + string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

DEFAULT_REQUEST_PARAMS = {
    "output_mode": "json"
}


def get_indicators_collection(session) -> list:
    return get_collection(session, "indicators")

def get_identities_collection(session) -> list:
    return get_collection(session, "identities")

def get_groupings_collection(session) -> list:
    return get_collection(session, "groupings")

def get_submissions_collection(session) -> list:
    return get_collection(session, "submissions")

def get_sightings_collection(session) -> list:
    return get_collection(session, "sightings")

def get_collection(session, collection_name: str) -> list:
    # Handle pagination, limits.conf: max_rows_per_query = 50000
    records = []
    offset = 0
    page_size = 20000
    while True:
        resp = session.get(f'{SPLUNK_ADMIN_URL}/servicesNS/nobody/{CTIS_APP_NAME}/storage/collections/data/{collection_name}',
                           params={**DEFAULT_REQUEST_PARAMS, "limit": page_size, "skip": offset})
        resp_raise_for_status_and_log_response(resp)
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
    resp_raise_for_status_and_log_response(resp)

def clear_indicators_collection(session):
    clear_collection(session, "indicators")

def clear_identities_collection(session):
    clear_collection(session, "identities")

def clear_groupings_collection(session):
    clear_collection(session, "groupings")

def clear_submissions_collection(session):
    clear_collection(session, "submissions")

def clear_sightings_collection(session):
    clear_collection(session, "sightings")

def resp_raise_for_status_and_log_response(resp):
    if not resp.ok:
        logger.error(f"Response status code: {resp.status_code}, Response text: {resp.text}")
    resp.raise_for_status()

def bulk_insert_indicators(session, indicators: list):
    # do it in batches of 1000
    batches = [indicators[i:i + 1000] for i in range(0, len(indicators), 1000)]
    for batch in batches:
        resp = session.post(
            f'{SPLUNK_ADMIN_URL}/servicesNS/nobody/{CTIS_APP_NAME}/storage/collections/data/indicators/batch_save',
            params=DEFAULT_REQUEST_PARAMS, json=batch)
        resp_raise_for_status_and_log_response(resp)


def delete_endpoint(endpoint:str, session, payload: dict) -> dict:
    resp = session.delete(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/{endpoint}',
                        params=DEFAULT_REQUEST_PARAMS, json=payload)
    resp_raise_for_status_and_log_response(resp)
    return resp.json()

def post_endpoint(endpoint:str, session, payload: dict) -> dict:
    resp = session.post(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/{endpoint}',
                        params=DEFAULT_REQUEST_PARAMS, json=payload)
    resp_raise_for_status_and_log_response(resp)
    return resp.json()

def get_endpoint(endpoint:str, session, **query_params) -> dict:
    resp = session.get(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/{endpoint}',
                        params={**DEFAULT_REQUEST_PARAMS, **query_params})
    resp_raise_for_status_and_log_response(resp)
    return resp.json()

def create_new_indicator(session, payload: dict) -> dict:
    return post_endpoint(endpoint="create-indicator", session=session, payload=payload)

def create_new_identity(session, payload: dict) -> dict:
    return post_endpoint(endpoint="create-identity", session=session, payload=payload)

def create_new_grouping(session, payload: dict) -> dict:
    return post_endpoint(endpoint="create-grouping", session=session, payload=payload)

def create_new_sighting(session, payload: dict) -> dict:
    return post_endpoint(endpoint="create-sighting", session=session, payload=payload)

def validate_stix_indicators(session, indicators: list) -> dict:
    """Validate STIX indicators and check for existing IDs"""
    return post_endpoint(endpoint="import-stix", session=session, payload={
        "action": "validate",
        "model_type": "indicator",
        "stix_objects": indicators
    })

def validate_stix_identities(session, identities: list) -> dict:
    """Validate STIX identities and check for existing IDs"""
    return post_endpoint(endpoint="import-stix", session=session, payload={
        "action": "validate",
        "model_type": "identity",
        "stix_objects": identities
    })

def import_stix_identities(session, identities: List, overwrite_existing: bool = False) -> Dict:
    payload = {
        "action": "import",
        "model_type": "identity",
        "overwrite_existing": overwrite_existing,
        "stix_objects": identities
    }
    return post_endpoint(endpoint="import-stix", session=session, payload=payload)

def import_stix_indicators(session, indicators: List, new_grouping: Dict, overwrite_existing: bool = False) -> Dict:
    payload = {
        "action": "import",
        "model_type": "indicator",
        "overwrite_existing": overwrite_existing,
        "stix_objects": indicators,
        "new_grouping": new_grouping
    }
    return post_endpoint(endpoint="import-stix", session=session, payload=payload)

def edit_identity(session, payload: dict) -> dict:
    return post_endpoint(endpoint="edit-identity", session=session, payload=payload)

def edit_grouping(session, payload: dict) -> dict:
    return post_endpoint(endpoint="edit-grouping", session=session, payload=payload)

def edit_indicator(session, payload: dict) -> dict:
    return post_endpoint(endpoint="edit-indicator", session=session, payload=payload)

def edit_sighting(session, payload: dict) -> dict:
    return post_endpoint(endpoint="edit-sighting", session=session, payload=payload)

def delete_identity(session, identity_id: str) -> dict:
    return delete_endpoint(endpoint="delete-identity", session=session, payload={
        "identity_id": identity_id
    })

def delete_grouping(session, grouping_id: str) -> dict:
    return delete_endpoint(endpoint="delete-grouping", session=session, payload={
        "grouping_id": grouping_id
    })

def delete_sighting(session, sighting_id: str) -> dict:
    return delete_endpoint(endpoint="delete-sighting", session=session, payload={
        "sighting_id": sighting_id
    })

def delete_indicators_by_grouping_id(session, grouping_id: str) -> dict:
    return delete_endpoint(endpoint="delete-indicator", session=session, payload={
        "grouping_id": grouping_id
    })

def delete_indicators(session, indicator_ids: List[str]) -> dict:
    return delete_endpoint(endpoint="delete-indicator", session=session, payload={
        "indicator_id": indicator_ids
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
    resp_raise_for_status_and_log_response(resp)
    return resp.json()


def list_indicators(session, skip: int=0, limit: int=0, query: dict = None) -> dict:
    return query_collection_endpoint(endpoint="list-indicators", session=session, skip=skip, limit=limit, query=query)

def list_identities(session, skip: int, limit: int, query: dict = None) -> dict:
    return query_collection_endpoint(endpoint="list-identities", session=session, skip=skip, limit=limit, query=query)

def list_groupings(session, skip: int, limit: int, query: dict = None) -> dict:
    return query_collection_endpoint(endpoint="list-groupings", session=session, skip=skip, limit=limit, query=query)

def list_sightings(session, skip: int = 0, limit: int = 100, query: dict = None) -> dict:
    return query_collection_endpoint(endpoint="list-sightings", session=session, skip=skip, limit=limit, query=query)

def get_grouping(session, grouping_id: str) -> dict:
    resp = list_groupings(session=session, skip=0, limit=0, query={"grouping_id": grouping_id})
    assert resp["total"] == 1
    assert len(resp["records"]) == 1
    return resp["records"][0]

def list_submissions(session, skip: int=0, limit: int=0, query: dict = None) -> dict:
    return query_collection_endpoint(endpoint="list-submissions", session=session, skip=skip, limit=limit, query=query)

def get_submission(session, submission_id: str) -> dict:
    resp = list_submissions(session=session, skip=0, limit=0, query={"submission_id": submission_id})
    assert resp["total"] == 1
    assert len(resp["records"]) == 1
    return resp["records"][0]

def unschedule_submission(session, submission_id: str) -> dict:
    return post_endpoint(endpoint="unschedule-submission", session=session, payload={
        "submission_id": submission_id
    })

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

def example_stix_indicator(indicator_id: str = None) -> dict:
    """Create a minimal valid STIX 2.1 indicator object"""
    if indicator_id is None:
        indicator_id = f"indicator--{uuid.uuid4()}"

    return {
        "spec_version": "2.1",
        "type": "indicator",
        "id": indicator_id,
        "pattern_type": "stix",
        "pattern": f"[url:value = 'https://example-{uuid.uuid4()}.com']",
        "created": "2026-07-17T01:02:03.456Z",
        "modified": "2026-07-18T10:00:01.000Z",
        "valid_from": "2026-07-17T00:11:22.000Z"
    }

def example_stix_identity(identity_id: str = None, name: str = None, identity_class: str = "organization") -> dict:
    """Create a minimal valid STIX 2.1 identity object"""
    if identity_id is None:
        identity_id = f"identity--{uuid.uuid4()}"
    if name is None:
        name = f"Example Identity {uuid.uuid4()}"

    return {
        "spec_version": "2.1",
        "type": "identity",
        "id": identity_id,
        "name": name,
        "identity_class": identity_class,
        "created": "2026-07-17T01:02:03.456Z",
        "modified": "2026-07-18T10:00:01.000Z"
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

def new_sample_grouping(session, grouping_name="grouping-1", identity_name="identity-1", grouping_tlp_rating="TLP:GREEN") -> dict:
    identity = create_new_identity(session, {
        "name": identity_name,
        "identity_class": "organization",
        "confidence": 100,
        "tlp_v2_rating": "TLP:CLEAR",
    })["identity"]
    grouping = create_new_grouping(session, {
        "created_by_ref": identity["identity_id"],
        "name": grouping_name,
        "description": "description-1",
        "context": "unspecified",
        "confidence": 100,
        "tlp_v2_rating": grouping_tlp_rating,
    })["grouping"]
    assert grouping["grouping_id"] is not None
    return grouping

def example_sighting(indicator_id: str, **kwargs) -> dict:
    """Create example sighting payload with overridable fields"""
    base = {
        "sighting_of_ref": indicator_id,
    }
    base.update(kwargs)
    return base


def get_stix_bundle_json_preview(session, grouping_id: str, include_sightings: bool = False) -> dict:
    query_params = {
        "grouping_id": grouping_id,
    }
    if include_sightings:
        query_params["include_sightings"] = "1"

    return get_endpoint(endpoint="get-stix-bundle-for-grouping", session=session, **query_params)


def post_submit_grouping_to_taxii_server(session, grouping_id: str, taxii_config_name: str, taxii_collection_id: str,
                                         scheduled_at: str = None, include_sightings: bool = False) -> dict:
    payload = {
        "grouping_id": grouping_id,
        "taxii_config_name": taxii_config_name,
        "taxii_collection_id": taxii_collection_id,
        "include_sightings": include_sightings
    }
    if scheduled_at is not None:
        payload["scheduled_at"] = scheduled_at

    return post_endpoint(endpoint="submit-grouping", session=session, payload=payload)

def create_new_taxii_config(session, taxii_config_name: str, api_root_url:str, username:str, password:str) -> Optional[dict]:
    resp = session.post(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/TA_CTIS_TAXII_taxii_config', data={
        'name': taxii_config_name,
        'api_root_url': api_root_url,
        'auth_type': 'basic',
        'username': username,
        'password': password,
    }, params=DEFAULT_REQUEST_PARAMS)
    if resp.ok:
        return resp.json()
    logger.error(f"Failed to create TAXII config. Status code: {resp.status_code}, Response text: {resp.text}")
    resp.raise_for_status()
    return None

def delete_taxii_config(session, taxii_config_name: str) -> dict:
    resp = session.delete(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/TA_CTIS_TAXII_taxii_config/{taxii_config_name}', params=DEFAULT_REQUEST_PARAMS)
    resp_raise_for_status_and_log_response(resp)
    return resp.json()

def get_advanced_settings(session) -> dict:
    resp = session.get(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/TA_CTIS_TAXII_settings/advanced_settings', params={"output_mode" : "json"})
    resp.raise_for_status()
    j = resp.json()
    if "entry" in j and len(j["entry"]) > 0:
        return j["entry"][0]["content"]
    else:
        raise RuntimeError(f"Expected response to have 'entry' to be a non-empty array.")

def update_advanced_settings(session, enable_indicators_cleanup: bool = False) -> dict:
    resp = session.post(f'{SPLUNK_ADMIN_URL}/servicesNS/-/{CTIS_APP_NAME}/TA_CTIS_TAXII_settings/advanced_settings', data={
        "enable_indicators_cleanup": int(enable_indicators_cleanup),
    }, params={"output_mode" : "json"})
    resp.raise_for_status()
    return resp.json()
