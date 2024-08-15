from datetime import datetime

import pytest
from marshmallow.exceptions import ValidationError

from TA_CTIS_TAXII_ES_AR.package.bin.models.indicator import IndicatorV1


def test_from_invalid_dict():
    with pytest.raises(ValidationError):
        # Missing required fields
        _ = IndicatorV1.schema().load({"something": "else"})


SAMPLE_INDICATOR_INSTANCE = IndicatorV1(
    grouping_id="A",
    indicator_id="indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59",
    splunk_field_name="src_ip",
    splunk_field_value="1.2.3.4",
    name="name",
    description="desc",
    stix_pattern="[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']",
    confidence=42,
    tlp_v1_rating="GREEN",
    valid_from=datetime(2024, 8, 14, 23, 9, 21, 123456),
    _user="nobody",
    _key="66bd393930444c60800ab750")

SAMPLE_INDICATOR_JSON = {
    "schema_version": 1,
    "grouping_id": "A",
    "indicator_id": "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59",
    "splunk_field_name": "src_ip",
    "splunk_field_value": "100.2.3.4",
    "name": "name",
    "description": "desc",
    "stix_pattern": "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '100.2.3.4']",
    "confidence": 100,
    "tlp_v1_rating": "WHITE",
    "valid_from": "2024-08-14T23:09:21.290",
    "_user": "nobody",
    "_key": "66bd393930444c60800ab750"
}


def test_from_valid_dict_with_splunk_reserved_fields():
    as_dict = SAMPLE_INDICATOR_JSON
    indicator = IndicatorV1.schema().load(as_dict)
    assert indicator.grouping_id == "A"
    assert indicator.indicator_id == "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59"
    assert indicator.splunk_field_name == "src_ip"
    assert indicator.splunk_field_value == "100.2.3.4"
    assert indicator.valid_from == datetime(2024, 8, 14, 23, 9, 21, 290000)


def test_from_valid_dict_without_splunk_reserved_fields():
    as_dict = SAMPLE_INDICATOR_JSON
    del as_dict["_user"]
    del as_dict["_key"]
    indicator = IndicatorV1.schema().load(as_dict)
    assert indicator.indicator_id == "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59"
    assert indicator._key is None
    assert indicator._user is None


def test_to_dict():
    indicator = SAMPLE_INDICATOR_INSTANCE
    as_dict = indicator.to_dict()
    assert as_dict["schema_version"] == 1
    assert as_dict["grouping_id"] == "A"
    assert as_dict["indicator_id"] == "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59"
    assert as_dict["splunk_field_name"] == "src_ip"
    assert as_dict["splunk_field_value"] == "1.2.3.4"
    assert as_dict["valid_from"] == "2024-08-14T23:09:21.123456"


def test_validate_schema_version():
    indicator_json = SAMPLE_INDICATOR_JSON
    indicator_json["schema_version"] = 2
    with pytest.raises(ValidationError) as exc_info:
        _ = IndicatorV1.schema().load(indicator_json)
    assert "schema_version" in str(exc_info.value)


@pytest.mark.parametrize("confidence", [-1, 101])
def test_validate_confidence_in_range_0_to_100(confidence):
    indicator_json = SAMPLE_INDICATOR_JSON
    indicator_json["confidence"] = confidence
    with pytest.raises(ValidationError) as exc_info:
        _ = IndicatorV1.schema().load(indicator_json)
    assert "confidence" in str(exc_info.value)


def test_validate_tlp_v1_rating():
    indicator_json = SAMPLE_INDICATOR_JSON
    indicator_json["tlp_v1_rating"] = "INVALID"
    with pytest.raises(ValidationError) as exc_info:
        _ = IndicatorV1.schema().load(indicator_json)

    assert "tlp_v1_rating" in str(exc_info.value)


def test_validate_stix_pattern():
    indicator_json = SAMPLE_INDICATOR_JSON
    indicator_json["stix_pattern"] = "[abc]"
    with pytest.raises(ValidationError) as exc_info:
        _ = IndicatorV1.schema().load(indicator_json)

    assert "stix_pattern" in str(exc_info.value)


@pytest.mark.parametrize("indicator_id", ["aaa", "indicator--invalid"])
def test_validate_indicator_id(indicator_id):
    indicator_json = SAMPLE_INDICATOR_JSON
    indicator_json["indicator_id"] = indicator_id
    with pytest.raises(ValidationError) as exc_info:
        _ = IndicatorV1.schema().load(indicator_json)

    assert "indicator_id" in str(exc_info.value)
