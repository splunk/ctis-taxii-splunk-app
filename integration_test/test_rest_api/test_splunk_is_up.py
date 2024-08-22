from .util import SPLUNK_ADMIN_URL, CTIS_APP_NAME, DEFAULT_REQUEST_PARAMS


class TestVerifySplunkIsUp:
    def test_splunk_is_up(self, session):
        resp = session.get(SPLUNK_ADMIN_URL)
        resp.raise_for_status()

    def test_verify_app_is_installed(self, session):
        resp = session.get(f'{SPLUNK_ADMIN_URL}/services/apps/local/{CTIS_APP_NAME}', params=DEFAULT_REQUEST_PARAMS)
        resp.raise_for_status()
        j = resp.json()
        entries = j["entry"]
        assert len(entries) == 1
        entry = entries[0]
        assert entry["name"] == CTIS_APP_NAME
