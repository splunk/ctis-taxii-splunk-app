from datetime import datetime

from TA_CTIS_TAXII.package.bin.models import IndicatorModelV1, TLPv2

GROUPING_ID = "grouping--184f5231-02f6-49e8-8230-b740f4b82331"
IDENTITY_ID = "identity--a463ffb3-1bd9-4d94-b02d-74e4f1658283"

SAMPLE_DICT = {
    "schema_version": 1,
    "grouping_id": GROUPING_ID,
    "indicator_id": "indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59",
    "splunk_field_name": "src_ip",
    "indicator_value": "100.2.3.4",
    "indicator_category": "source_ipv4",
    "name": "name",
    "description": "desc",
    "stix_pattern": "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '100.2.3.4']",
    "confidence": 100,
    "tlp_v2_rating": "TLP:CLEAR",
    "valid_from": "2024-08-14T23:09:21.290",
    "_user": "nobody",
    "_key": "66bd393930444c60800ab750"
}


def get_sample_dict():
    return SAMPLE_DICT.copy()


SAMPLE_DICT_NO_SPLUNK_RESERVED_FIELDS = {k: v for k, v in SAMPLE_DICT.items() if k not in ["_user", "_key"]}

SAMPLE_INDICATOR_INSTANCE = IndicatorModelV1(
    grouping_id=GROUPING_ID,
    indicator_id="indicator--e669f9b4-80b1-4e66-97f1-d00227ac6c59",
    splunk_field_name="src_ip",
    indicator_value="1.2.3.4",
    indicator_category="source_ipv4",
    name="name",
    description="desc",
    stix_pattern="[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']",
    confidence=42,
    tlp_v2_rating=TLPv2.GREEN,
    valid_from=datetime(2024, 8, 14, 23, 9, 21, 123456),
    user="nobody",
    key="66bd393930444c60800ab750"
)

def new_sample_indicator_instance():
    return IndicatorModelV1(
        grouping_id=GROUPING_ID,
        splunk_field_name="src_ip",
        indicator_value="1.2.3.4",
        indicator_category="source_ipv4",
        name="name",
        description="desc",
        stix_pattern="[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']",
        confidence=42,
        tlp_v2_rating=TLPv2.GREEN,
        valid_from=datetime(2024, 8, 14, 23, 9, 21, 123456),
    )
