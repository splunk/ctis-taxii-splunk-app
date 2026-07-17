import pytz

from TA_CTIS_TAXII.package.bin.models import IndicatorModelV1
from datetime import datetime

IDENTITY_ID = "identity--4ddedd72-6517-4ddb-807e-db4fd0afe1a8"
INDICATOR_ID = "indicator--c1e4f15d-cb46-496c-b50e-c24efdf7c90e"
GROUPING_ID = "grouping--cee56137-d1a9-4d60-8c8f-0809a63fe15a"

URL_PATTERN = "[url:value = 'https://example.com']"

MINIMAL_INDICATOR_STIX_JSON = {
    "spec_version": "2.1",
    "type": "indicator",
    "id": INDICATOR_ID,
    "pattern_type": "stix",
    "pattern": URL_PATTERN,
    "created": "2026-07-17T01:02:03.456Z",
    "modified": "2026-07-18T10:00:01.000Z",
    "valid_from": "2026-07-17T00:11:22.000Z"
}

class TestParseFromStix2Json:
    def test_should_parse_stix_json(self):
        indicator = IndicatorModelV1.from_stix_object(stix_json={
            **MINIMAL_INDICATOR_STIX_JSON,
            "confidence": 99,
            "labels": ["label-1", "label-2"],
            "created_by_ref": IDENTITY_ID
        }, grouping_id=GROUPING_ID)

        assert indicator.indicator_id == INDICATOR_ID
        assert indicator.stix_pattern == URL_PATTERN
        assert indicator.created == datetime(2026, 7, 17, 1, 2, 3, 456_000, tzinfo=pytz.UTC)
        assert indicator.modified == datetime(2026, 7, 18, 10, 0, 1, 0, tzinfo=pytz.UTC)
        assert indicator.confidence == 99
        assert indicator.created_by_ref == IDENTITY_ID

    def test_should_parse_labels(self):
        indicator = IndicatorModelV1.from_stix_object(stix_json={
            **MINIMAL_INDICATOR_STIX_JSON,
            "labels": ["label-1", "label-2"]
        }, grouping_id=GROUPING_ID)
        assert indicator.labels == ["label-1", "label-2"]

    def test_should_parse_valid_until(self):
        indicator = IndicatorModelV1.from_stix_object(stix_json={
            **MINIMAL_INDICATOR_STIX_JSON,
            "valid_until": "2026-08-01T01:02:03Z"
        }, grouping_id=GROUPING_ID)
        assert indicator.valid_until == datetime(2026, 8, 1, 1, 2, 3, tzinfo=pytz.UTC)

    def test_should_parse_revoked(self):
        raise NotImplementedError

    def test_should_allow_custom_keys(self):
        # Should allow custom fields in the Indicator JSON such as "x_opencti_score"
        raise NotImplementedError
