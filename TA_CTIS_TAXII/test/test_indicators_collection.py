from unittest.mock import patch

from freezegun import freeze_time

from TA_CTIS_TAXII.package.bin.models.kvstore_collections import IndicatorsCollection


@freeze_time("2026-01-02 13:11:22")
def test_fetch_expired_or_revoked_indicators():
    collection = IndicatorsCollection(session_key="session_key", app_namespace="namespace")
    fetch_many_structured_mock_result = [{"indicator_id": "1234"}]
    with patch.object(IndicatorsCollection, 'fetch_many_structured') as mock:
        mock.return_value = fetch_many_structured_mock_result
        result = collection.fetch_expired_or_revoked()
        mock.assert_called_with(query={"$or": [
            {"revoked": True},
            {"valid_until": {"$lt": "2026-01-02T13:11:22"}},
        ]})
        assert result == fetch_many_structured_mock_result
