from datetime import datetime
import attrs
import pytest
from cattrs import ClassValidationError, transform_error

from TA_CTIS_TAXII.package.bin.models.indicator import IndicatorModelV1, indicator_converter, form_payload_to_indicators, maximum_tlpv2_of_indicators
from TA_CTIS_TAXII.package.bin.models.tlp_v2 import TLPv2, GREEN_MARKING_DEFINITION
from TA_CTIS_TAXII.test.sample_indicator import GROUPING_ID, IDENTITY_ID, SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS, \
    SAMPLE_INDICATOR_INSTANCE, get_sample_dict, new_sample_indicator_instance


def test_from_dict_missing_required_fields():
    with pytest.raises(ClassValidationError) as exc_info:
        indicator_converter.structure({"something": "else"}, IndicatorModelV1)
    error_strings = transform_error(exc_info.value)
    assert all(['required field missing' in x for x in error_strings])


def test_from_valid_dict_scenario_creation():
    # Autogenerate indicator_id if not provided
    as_dict = get_sample_dict()
    del as_dict["indicator_id"]
    assert "created" not in as_dict
    assert "modified" not in as_dict

    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.indicator_id.startswith("indicator--")
    assert type(indicator.created) is datetime
    assert type(indicator.modified) is datetime

def test_from_valid_dict_scenario_update():
    as_dict = get_sample_dict()
    as_dict["created"] = "2024-01-23T23:40:33"
    as_dict["modified"] = "2024-08-01T11:22:33"
    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.indicator_id == as_dict["indicator_id"]
    assert indicator.created == datetime(2024, 1, 23, 23, 40, 33)
    assert indicator.modified == datetime(2024, 8, 1, 11, 22, 33)

def test_from_valid_dict_without_splunk_field_name():
    as_dict = get_sample_dict()
    del as_dict["splunk_field_name"]
    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.splunk_field_name is None, "Optional field"


def test_from_valid_dict_with_splunk_reserved_fields():
    as_dict = get_sample_dict()
    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.schema_version == 1
    assert indicator.key == "66bd393930444c60800ab750"
    assert indicator.user == "nobody"
    assert indicator.name == "name"
    assert indicator.description == "desc"
    assert indicator.stix_pattern == "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '100.2.3.4']"
    assert indicator.tlp_v2_rating == TLPv2.CLEAR
    assert indicator.confidence == 100
    assert indicator.grouping_id == GROUPING_ID
    assert indicator.indicator_id == "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59"
    assert indicator.splunk_field_name == "src_ip"
    assert indicator.indicator_value == "100.2.3.4"
    assert indicator.valid_from == datetime(2024, 8, 14, 23, 9, 21, 290000)


def test_from_valid_dict_without_splunk_reserved_fields():
    as_dict = SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS
    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.key is None
    assert indicator.user is None
    assert indicator.grouping_id == GROUPING_ID
    assert indicator.splunk_field_name == "src_ip"
    assert indicator.indicator_value == "100.2.3.4"


def test_from_valid_dict_without_schema_version():
    as_dict = get_sample_dict()
    del as_dict["schema_version"]
    indicator = indicator_converter.structure(as_dict, IndicatorModelV1)
    assert indicator.schema_version == 1, "Should set default version as 1"
    assert indicator.grouping_id == GROUPING_ID
    assert indicator.splunk_field_name == "src_ip"
    assert indicator.indicator_value == "100.2.3.4"


def test_to_dict_without_splunk_reserved_fields():
    indicator = attrs.evolve(SAMPLE_INDICATOR_INSTANCE, key=None, user=None)
    as_dict = indicator_converter.unstructure(indicator)
    assert "key" not in as_dict
    assert "_key" not in as_dict, "Should not serialize key if it is None"
    assert "user" not in as_dict
    assert "_user" not in as_dict, "Should not serialize user if it is None"


def test_to_dict():
    indicator = attrs.evolve(SAMPLE_INDICATOR_INSTANCE,
                             created=datetime(2024, 8, 14, 23, 9, 21, 0),
                             modified=datetime(2024, 8, 14, 23, 9, 30, 123456))
    as_dict = indicator_converter.unstructure(indicator)
    assert as_dict["schema_version"] == 1

    assert as_dict["created"] == "2024-08-14T23:09:21"
    assert as_dict["modified"] == "2024-08-14T23:09:30.123456"

    # 'key' should be serialized as '_key'
    assert as_dict["_key"] == "66bd393930444c60800ab750"
    assert "key" not in as_dict
    # 'user' should be serialized as '_user'
    assert as_dict["_user"] == "nobody"
    assert "user" not in as_dict

    assert as_dict["name"] == "name"
    assert as_dict["description"] == "desc"
    assert as_dict[
               "stix_pattern"] == "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']"
    assert as_dict["tlp_v2_rating"] == "TLP:GREEN"
    assert as_dict["confidence"] == 42
    assert as_dict["grouping_id"] == GROUPING_ID
    assert as_dict["indicator_id"] == "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59"
    assert as_dict["splunk_field_name"] == "src_ip"
    assert as_dict["indicator_value"] == "1.2.3.4"
    assert as_dict["indicator_category"] == "source_ipv4"
    assert as_dict["valid_from"] == "2024-08-14T23:09:21.123456"


@pytest.mark.parametrize("indicator_id", ["aaa", "indicator--invalid"])
def test_validate_indicator_id(indicator_id):
    as_dict = get_sample_dict()
    as_dict["indicator_id"] = indicator_id
    with pytest.raises(Exception) as exc_info:
        indicator_converter.structure(as_dict, IndicatorModelV1)
    exc_string = repr(exc_info.value)
    assert "Invalid indicator_id" in exc_string


def test_validate_schema_version():
    indicator_json = get_sample_dict()
    indicator_json["schema_version"] = 2
    with pytest.raises(Exception) as exc_info:
        _ = indicator_converter.structure(indicator_json, IndicatorModelV1)
    err_string = repr(exc_info.value)
    assert "schema_version must be 1" in err_string


@pytest.mark.parametrize("confidence", [-1, 101])
def test_validate_confidence_in_range_0_to_100(confidence):
    indicator_json = get_sample_dict()
    indicator_json["confidence"] = confidence
    with pytest.raises(ClassValidationError) as exc_info:
        _ = indicator_converter.structure(indicator_json, IndicatorModelV1)
    assert "confidence must be between 0 and 100" in repr(exc_info.value)


def test_validate_tlp_v2_rating():
    indicator_json = get_sample_dict()
    indicator_json["tlp_v2_rating"] = "INVALID"
    with pytest.raises(ClassValidationError) as exc_info:
        _ = indicator_converter.structure(indicator_json, IndicatorModelV1)
    assert "'INVALID' is not a valid TLP" in repr(exc_info.value)


def test_validate_stix_pattern():
    indicator_json = get_sample_dict()
    indicator_json["stix_pattern"] = "[aaa]"
    with pytest.raises(ClassValidationError) as exc_info:
        _ = indicator_converter.structure(indicator_json, IndicatorModelV1)

    assert "Invalid STIX pattern" in repr(exc_info.value)

def test_on_creation_created_and_modified_timestamps_should_be_equal():
    indicator = new_sample_indicator_instance()
    created = indicator.created
    modified = indicator.modified
    assert created == modified, "On creation, created and modified timestamps should be equal"

def test_to_stix():
    indicator = new_sample_indicator_instance()
    stix = indicator.to_stix(created_by_ref=IDENTITY_ID)
    assert stix.id == indicator.indicator_id
    assert stix.created == indicator.created
    assert stix.modified == indicator.modified
    assert stix.name == indicator.name
    assert stix.description == indicator.description
    assert stix.pattern == indicator.stix_pattern
    assert stix.pattern_type == "stix"
    assert stix.valid_from == indicator.valid_from
    assert stix.confidence == indicator.confidence
    assert stix.object_marking_refs == [GREEN_MARKING_DEFINITION.id]
    assert stix.created_by_ref == IDENTITY_ID


@pytest.mark.parametrize("grouping_id", ["", None, "invalid"])
def test_validate_grouping_id(grouping_id):
    indicator_json = get_sample_dict()
    indicator_json["grouping_id"] = grouping_id
    with pytest.raises(ClassValidationError) as exc_info:
        _ = indicator_converter.structure(indicator_json, IndicatorModelV1)

def test_maximum_tlpv2_of_indicators():
    indicators = [
        attrs.evolve(new_sample_indicator_instance(), tlp_v2_rating=TLPv2.CLEAR),
        attrs.evolve(new_sample_indicator_instance(), tlp_v2_rating=TLPv2.AMBER),
        attrs.evolve(new_sample_indicator_instance(), tlp_v2_rating=TLPv2.GREEN),
    ]
    max_tlp = maximum_tlpv2_of_indicators(indicators)
    assert max_tlp == TLPv2.AMBER

class TestHandleFormPayload:
    def test_should_handle_indicators_list(self):
        payload = {
            "grouping_id": GROUPING_ID,
            "confidence": 100,
            "tlp_v2_rating": "TLP:CLEAR",
            "valid_from": "2024-08-14T23:09:21.290",
            "indicators" : [
                {
                    "splunk_field_name": "src_ip",
                    "indicator_value": "123.456.1.2",
                    "indicator_category": "source_ipv4",
                    "stix_pattern": "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '123.456.1.2']",
                    "name": "asdf",
                    "description": "adsf"
                }
            ]
        }
        errors, models = form_payload_to_indicators(payload)
        assert not errors
        assert len(models) == 1
    def test_should_produce_detailed_errors(self):
        payload = {
            "grouping_id": GROUPING_ID,
            "confidence": 100,
            "tlp_v2_rating": "TLP:CLEAR",
            "valid_from": "2024-08-14T23:09:21.290",
            "indicators" : [
                {
                    "splunk_field_name": "src_ip",
                    "indicator_value": "123.456.1.2",
                    "indicator_category": "source_ipv4",
                    "stix_pattern": "[invalid]",
                    "name": "asdf",
                    "description": "adsf"
                }
            ]
        }
        errors, models = form_payload_to_indicators(payload)
        first_error = errors[0]
        assert first_error["index"] == 0
        assert "Invalid STIX pattern" in first_error["errors"][0]
