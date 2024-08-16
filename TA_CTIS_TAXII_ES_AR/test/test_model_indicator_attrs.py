from datetime import datetime

import pytest
from TA_CTIS_TAXII_ES_AR.package.bin.models.indicator_attrs_model import indicator_converter, IndicatorModelV1
from TA_CTIS_TAXII_ES_AR.package.bin.models.tlp_v1 import TLPv1
from cattrs import ClassValidationError, transform_error

SAMPLE_DICT = {
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

SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS = {k: v for k, v in SAMPLE_DICT.items() if k not in ["_user", "_key"]}

SAMPLE_INDICATOR_INSTANCE = IndicatorModelV1(
    grouping_id="A",
    indicator_id="indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59",
    splunk_field_name="src_ip",
    splunk_field_value="1.2.3.4",
    name="name",
    description="desc",
    stix_pattern="[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']",
    confidence=42,
    tlp_v1_rating=TLPv1.GREEN,
    valid_from=datetime(2024, 8, 14, 23, 9, 21, 123456),
    user="nobody",
    key="66bd393930444c60800ab750"
)

def test_from_dict_missing_required_fields():
    with pytest.raises(ClassValidationError) as exc_info:
        indicator_converter.structure({"something": "else"}, IndicatorModelV1)
    error_strings = transform_error(exc_info.value)
    assert all(['required field missing' in x for x in error_strings])

def test_from_valid_dict_with_splunk_reserved_fields():
    as_dict = SAMPLE_DICT
    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.schema_version == 1
    assert indicator.key == "66bd393930444c60800ab750"
    assert indicator.user == "nobody"
    assert indicator.name == "name"
    assert indicator.description == "desc"
    assert indicator.stix_pattern == "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '100.2.3.4']"
    assert indicator.tlp_v1_rating == TLPv1.WHITE
    assert indicator.confidence == 100
    assert indicator.grouping_id == "A"
    assert indicator.indicator_id == "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59"
    assert indicator.splunk_field_name == "src_ip"
    assert indicator.splunk_field_value == "100.2.3.4"
    assert indicator.valid_from == datetime(2024, 8, 14, 23, 9, 21, 290000)

def test_from_valid_dict_without_splunk_reserved_fields():
    as_dict = SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS
    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.key is None
    assert indicator.user is None
    assert indicator.grouping_id == "A"
    assert indicator.splunk_field_name == "src_ip"
    assert indicator.splunk_field_value == "100.2.3.4"

def test_from_valid_dict_without_schema_version():
    as_dict = SAMPLE_DICT
    del as_dict["schema_version"]
    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.schema_version == 1, "Should set default version as 1"
    assert indicator.grouping_id == "A"
    assert indicator.splunk_field_name == "src_ip"
    assert indicator.splunk_field_value == "100.2.3.4"

def test_to_dict():
    indicator = SAMPLE_INDICATOR_INSTANCE
    as_dict = indicator_converter.unstructure(indicator)
    assert as_dict["schema_version"] == 1
    assert as_dict["_key"] == "66bd393930444c60800ab750"
    assert as_dict["_user"] == "nobody"
    assert as_dict["name"] == "name"
    assert as_dict["description"] == "desc"
    assert as_dict["stix_pattern"] == "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']"
    assert as_dict["tlp_v1_rating"] == "GREEN"
    assert as_dict["confidence"] == 42
    assert as_dict["grouping_id"] == "A"
    assert as_dict["indicator_id"] == "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59"
    assert as_dict["splunk_field_name"] == "src_ip"
    assert as_dict["splunk_field_value"] == "1.2.3.4"
    assert as_dict["valid_from"] == "2024-08-14T23:09:21.123456"


@pytest.mark.parametrize("indicator_id", ["aaa", "indicator--invalid"])
def test_validate_indicator_id(indicator_id):
    as_dict = SAMPLE_DICT
    as_dict["indicator_id"] = indicator_id
    with pytest.raises(Exception) as exc_info:
        indicator_converter.structure(as_dict, IndicatorModelV1)
    exc_string = str(exc_info.value.exceptions)
    assert "Invalid indicator_id" in exc_string


