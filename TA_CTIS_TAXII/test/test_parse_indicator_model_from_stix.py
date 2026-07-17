import pytz

from package.bin.models import IndicatorModelV1
from TA_CTIS_TAXII.test.sample_indicator import GROUPING_ID
from datetime import datetime

class TestParseFromStix2Json:
    def test_should_parse_stix_json(self):
        indicator_id = "indicator--c1e4f15d-cb46-496c-b50e-c24efdf7c90e"
        pattern =  "[url:value = 'https://example.com']"
        indicator = IndicatorModelV1.from_stix_object(stix_json={
            "spec_version": "2.1",
            "type": "indicator",
            "id": indicator_id,
            "pattern_type": "stix",
            "pattern": pattern,
            "created" : "2026-07-17T01:02:03.456Z",
            "modified": "2026-07-18T10:00:01.000Z",
            "confidence": 99,
            "labels": ["label-1", "label-2"],
        }, grouping_id=GROUPING_ID)

        assert indicator.indicator_id == indicator_id
        assert indicator.stix_pattern == pattern
        assert indicator.created == datetime(2026, 7, 17, 1, 2, 3, 456_000, tzinfo=pytz.UTC)
        assert indicator.modified == datetime(2026, 7, 18, 10, 0, 1, 0, tzinfo=pytz.UTC)
        assert indicator.confidence == 99

    def test_should_parse_labels(self):
        raise NotImplementedError

    def test_should_parse_valid_until(self):
        raise NotImplementedError

    def test_should_parse_revoked(self):
        raise NotImplementedError

    def test_should_allow_custom_keys(self):
        # Should allow custom fields in the Indicator JSON such as "x_opencti_score"
        raise NotImplementedError
