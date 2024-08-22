import pytest
import requests
import os
from .util import clear_indicators_collection

SPLUNK_USERNAME = os.environ['SPLUNK_USERNAME']
SPLUNK_PASSWORD = os.environ['SPLUNK_PASSWORD']

@pytest.fixture
def cleanup_indicators_collection(session):
    clear_indicators_collection(session)
    yield
    clear_indicators_collection(session)

@pytest.fixture
def session():
    session = requests.Session()
    session.auth = (SPLUNK_USERNAME, SPLUNK_PASSWORD)
    session.verify = False
    return session

