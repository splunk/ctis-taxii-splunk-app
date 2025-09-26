from typing import Generator

import pytest
import requests
import os
import logging
from dataclasses import dataclass

from util import clear_groupings_collection, clear_submissions_collection, clear_indicators_collection, clear_identities_collection, \
    create_indicator_form_payload, create_new_indicator, create_new_taxii_config, example_indicator, \
    new_sample_grouping, random_alnum_string, \
    delete_taxii_config
from fixture_taxii_server import Taxii2ServerConnectionInfo, taxii2_server, taxii2_server_session, taxii2_server_is_reachable  # noqa: F401

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

SPLUNK_USERNAME = os.environ['SPLUNK_USERNAME']
SPLUNK_PASSWORD = os.environ['SPLUNK_PASSWORD']

@pytest.fixture
def cleanup_all_collections(cleanup_identities_collection, cleanup_groupings_collection, cleanup_indicators_collection, cleanup_submissions_collection):
    yield

@pytest.fixture
def cleanup_indicators_collection(session):
    clear_indicators_collection(session)
    yield
    clear_indicators_collection(session)

@pytest.fixture
def cleanup_identities_collection(session):
    clear_identities_collection(session)
    yield
    clear_identities_collection(session)

@pytest.fixture
def cleanup_groupings_collection(session):
    clear_groupings_collection(session)
    yield
    clear_groupings_collection(session)

@pytest.fixture
def cleanup_submissions_collection(session):
    clear_submissions_collection(session)
    yield
    clear_submissions_collection(session)

def new_session():
    session = requests.Session()
    session.auth = (SPLUNK_USERNAME, SPLUNK_PASSWORD)
    session.verify = False
    return session

@pytest.fixture
def session():
    return new_session()

@pytest.fixture
def testing_context_id():
    return f"test_{random_alnum_string()}"

@pytest.fixture
def ctis_app_taxii_config(session, taxii2_server, testing_context_id):
    taxii_config_name = f"{testing_context_id}_taxii_config"
    create_new_taxii_config(session=session,
                                   taxii_config_name=taxii_config_name,
                                   api_root_url=taxii2_server.default_api_root_url,
                                   username=taxii2_server.username,
                                   password=taxii2_server.password)
    yield taxii_config_name

    # cleanup: delete taxii config from app
    delete_taxii_config(session=session, taxii_config_name=taxii_config_name)

@dataclass
class TaxiiServerTestContext:
    grouping_id: str
    taxii_config_name: str
    taxii2_server: Taxii2ServerConnectionInfo

@pytest.fixture
def taxii_server_setup_and_grouping(session, taxii2_server, taxii2_server_is_reachable, ctis_app_taxii_config, testing_context_id) -> Generator[TaxiiServerTestContext, None, None]:
    grouping = new_sample_grouping(session=session, identity_name=f"{testing_context_id}_identity", grouping_name=f"{testing_context_id}_grouping")

    grouping_id = grouping["grouping_id"]
    logger.info(f"Created grouping with ID: {grouping_id} => {grouping}")

    indicator = example_indicator()
    create_indicators_payload = create_indicator_form_payload(grouping_id=grouping_id, indicators=[indicator])
    create_indicators_resp = create_new_indicator(session, payload=create_indicators_payload)
    logger.info(f"Created indicator: {create_indicators_resp}")

    yield TaxiiServerTestContext(
        grouping_id=grouping_id,
        taxii_config_name=ctis_app_taxii_config,
        taxii2_server=taxii2_server
    )

    # TODO: Cleanup if needed
