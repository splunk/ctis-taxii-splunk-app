import pytest
import requests
import os
from .util import clear_groupings_collection, clear_indicators_collection, clear_identities_collection

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

@pytest.fixture
def session():
    session = requests.Session()
    session.auth = (SPLUNK_USERNAME, SPLUNK_PASSWORD)
    session.verify = False
    return session

