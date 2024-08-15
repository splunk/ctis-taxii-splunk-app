from datetime import datetime

import pytest
from TA_CTIS_TAXII_ES_AR.package.bin.models.indicator_attrs_model import IndicatorModel
from cattrs import structure, unstructure

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
SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS = SAMPLE_DICT.copy()
del SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS["_user"]
del SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS["_key"]


def test_from_valid_dict_with_splunk_reserved_fields():
    as_dict = SAMPLE_DICT
    indicator = structure(as_dict, IndicatorModel)
    assert indicator._key == "66bd393930444c60800ab750"
    assert indicator._user == "nobody"

def test_from_valid_dict_without_splunk_reserved_fields():
    as_dict = SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS
    indicator = structure(as_dict, IndicatorModel)
    assert indicator._key is None
    assert indicator._user is None

@pytest.mark.parametrize("indicator_id", ["aaa", "indicator--invalid"])
def test_validate_indicator_id(indicator_id):
    as_dict = SAMPLE_DICT
    as_dict["indicator_id"] = indicator_id
    with pytest.raises(Exception) as exc_info:
        structure(as_dict, IndicatorModel)
    exc_string = str(exc_info.value.exceptions)
    assert "Invalid indicator_id" in exc_string


