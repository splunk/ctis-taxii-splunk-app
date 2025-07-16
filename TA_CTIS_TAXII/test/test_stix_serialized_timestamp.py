import json
from datetime import datetime, timezone
from uuid import uuid4
from TA_CTIS_TAXII.package.bin.models import IndicatorModelV1, GroupingModelV1, IdentityModelV1, serialize_stix_object
from TA_CTIS_TAXII.package.bin.models.tlp_v2 import TLPv2

IDENTITY_ID = f"identity--{uuid4()}"


class TestSerializationOfTimestamps:
    """
    Test serialization of timestamps in STIX objects, ensuring that they are formatted correctly with six decimal places for fractional seconds.
    """

    def test_indicator(self):
        indicator = IndicatorModelV1(
            grouping_id=f"grouping--{uuid4()}",
            splunk_field_name="src_ip",
            indicator_value="1.2.3.4",
            indicator_category="source_ipv4",
            name="name",
            description="desc",
            stix_pattern="[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']",
            confidence=42,
            tlp_v2_rating=TLPv2.GREEN,
            created=datetime(2024, 8, 14, 23, 9, 21, 12345, tzinfo=timezone.utc),
            modified=datetime(2024, 8, 14, 23, 9, 21, 123, tzinfo=timezone.utc),
            valid_from=datetime(2024, 8, 14, 23, 9, 21, 123456, tzinfo=timezone.utc),
        )
        indicator_sdo = indicator.to_stix(created_by_ref=IDENTITY_ID)
        serialized = serialize_stix_object(stix_object=indicator_sdo)
        json_dict = json.loads(serialized)

        created = json_dict["created"]
        assert created == "2024-08-14T23:09:21.012345Z"

        modified = json_dict["modified"]
        assert modified == "2024-08-14T23:09:21.000123Z"

        valid_from = json_dict["valid_from"]
        assert valid_from == "2024-08-14T23:09:21.123456Z"

    def test_grouping(self):
        grouping = GroupingModelV1(
            name="Test Grouping",
            description="Grouping description",
            context="unspecified",
            created_by_ref=IDENTITY_ID,
            tlp_v2_rating=TLPv2.AMBER,
            created=datetime(2024, 8, 14, 23, 9, 21, 0, tzinfo=timezone.utc),
            modified=datetime(2024, 8, 14, 23, 9, 21, 1, tzinfo=timezone.utc),
        )
        grouping_sdo = grouping.to_stix(object_ids=[grouping.grouping_id])
        serialized = serialize_stix_object(stix_object=grouping_sdo)
        json_dict = json.loads(serialized)

        created = json_dict["created"]
        assert created == "2024-08-14T23:09:21.000000Z"

        modified = json_dict["modified"]
        assert modified == "2024-08-14T23:09:21.000001Z"

    def test_identity(self):
        identity = IdentityModelV1(
            name="Test Identity",
            identity_class="organization",
            tlp_v2_rating=TLPv2.AMBER_STRICT,
            created=datetime(2025, 1, 2, 3, 2, 1, 42, tzinfo=timezone.utc),
            modified=datetime(2024, 8, 14, 23, 9, 21, 420, tzinfo=timezone.utc),
        )
        identity_sdo = identity.to_stix()
        serialized = serialize_stix_object(stix_object=identity_sdo)
        json_dict = json.loads(serialized)

        created = json_dict["created"]
        assert created == "2025-01-02T03:02:01.000042Z"

        modified = json_dict["modified"]
        assert modified == "2024-08-14T23:09:21.000420Z"
