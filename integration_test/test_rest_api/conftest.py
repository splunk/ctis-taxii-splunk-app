import pytest
import requests
import os
from util import clear_groupings_collection, clear_indicators_collection, clear_identities_collection, \
    create_new_taxii_config, random_alnum_string, delete_taxii_config
from fixture_taxii_server import taxii2_server, taxii2_server_session # noqa: F401

SPLUNK_USERNAME = os.environ['SPLUNK_USERNAME']
SPLUNK_PASSWORD = os.environ['SPLUNK_PASSWORD']

@pytest.fixture
def cleanup_all_collections(cleanup_identities_collection, cleanup_groupings_collection, cleanup_indicators_collection):
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

def new_session():
    session = requests.Session()
    session.auth = (SPLUNK_USERNAME, SPLUNK_PASSWORD)
    session.verify = False
    return session

@pytest.fixture
def session():
    return new_session()

@pytest.fixture(scope='module')
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
