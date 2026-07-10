from datetime import datetime
import pytest

from TA_CTIS_TAXII.package.bin.models import SightingModelV1, sighting_converter, TLPv2
from TA_CTIS_TAXII.package.bin.models.tlp_v2 import GREEN_MARKING_DEFINITION

INDICATOR_ID = "indicator--26ffb872-1dd9-446e-b6f5-d58527e5b5d2"
IDENTITY_ID = "identity--a463ffb3-1bd9-4d94-b02d-74e4f1658283"
SIGHTING_ID_1 = "sighting--ee20065d-2555-424f-ad9e-0f8428623c75"
SIGHTING_ID_2 = "sighting--5f301ebe-faf9-4e0e-aee9-ed8cf60641d0"


def sample_minimal_sighting_dict_with_sighting_id():
    return {
        "sighting_id": SIGHTING_ID_1,
        "created": "2016-04-06T20:08:31.000",
        "modified": "2016-04-06T20:09:31.000",
        "sighting_of_ref": INDICATOR_ID
    }


def sample_maximal_sighting_dict_with_sighting_id():
    return {
        "sighting_id": SIGHTING_ID_2,
        "created": "2016-04-06T20:08:31.000",
        "modified": "2016-04-06T20:09:31.000",
        "sighting_of_ref": INDICATOR_ID,
        "description": "Test sighting",
        "first_seen": "2016-04-06T20:08:31.000",
        "last_seen": "2016-04-06T20:09:31.000",
        "count": 1,
        "where_sighted_refs": [IDENTITY_ID],
        "created_by_ref": IDENTITY_ID,
        "summary": True,
        "tlp_v2_rating": TLPv2.CLEAR,
        "confidence": 90,
        "labels": ["aaa", "bbb"],
        "revoked": True
    }


def sample_maximal_sighting_object() -> SightingModelV1:
    return SightingModelV1(
        sighting_id=SIGHTING_ID_1,
        sighting_of_ref=INDICATOR_ID,
        where_sighted_refs=[IDENTITY_ID],
        created_by_ref=IDENTITY_ID,
        description="Test sighting",
        first_seen=datetime(2024, 1, 1, 12, 0, 0),
        last_seen=datetime(2024, 1, 2, 13, 0, 0),
        count=5,
        tlp_v2_rating=TLPv2.GREEN,
        confidence=75,
        summary=False,
        labels=["ccc", "ddd"],
        revoked=False
    )


def new_sample_sighting_instance():
    """Returns a new SightingModelV1 instance for testing"""
    return SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Test sighting",
        first_seen=datetime(2024, 1, 1, 12, 0, 0),
        last_seen=datetime(2024, 1, 2, 12, 0, 0),
        count=3,
        tlp_v2_rating=TLPv2.CLEAR,
        confidence=90,
    )


# A. Converter Tests (structure/unstructure)

class TestStructureFromDict:
    def test_minimal_with_sighting_id(self):
        as_dict = sample_minimal_sighting_dict_with_sighting_id()
        sighting = sighting_converter.structure(as_dict, SightingModelV1)

        assert sighting.sighting_id == SIGHTING_ID_1
        assert sighting.sighting_of_ref == INDICATOR_ID
        assert sighting.created == datetime(2016, 4, 6, 20, 8, 31)
        assert sighting.modified == datetime(2016, 4, 6, 20, 9, 31)

        # Assert default values
        assert sighting.description is None
        assert sighting.first_seen is None
        assert sighting.last_seen is None
        assert sighting.count is None
        assert sighting.where_sighted_refs == []
        assert sighting.created_by_ref is None
        assert sighting.summary is False
        assert sighting.tlp_v2_rating is None
        assert sighting.confidence == 100
        assert sighting.labels == []
        assert sighting.revoked is False

    def test_minimal_without_sighting_id(self):
        as_dict = sample_minimal_sighting_dict_with_sighting_id()
        del as_dict["sighting_id"]
        assert "sighting_id" not in as_dict
        sighting = sighting_converter.structure(as_dict, SightingModelV1)

        assert isinstance(sighting.sighting_id, str)
        assert sighting.sighting_id.startswith("sighting--"), "sighting_id should be auto-generated."

    def test_maximal_dict(self):
        as_dict = sample_maximal_sighting_dict_with_sighting_id()
        sighting = sighting_converter.structure(as_dict, SightingModelV1)
        assert sighting.sighting_id == SIGHTING_ID_2
        assert sighting.sighting_of_ref == INDICATOR_ID
        assert sighting.created == datetime(2016, 4, 6, 20, 8, 31)
        assert sighting.modified == datetime(2016, 4, 6, 20, 9, 31)
        assert sighting.description == "Test sighting"
        assert sighting.first_seen == datetime(2016, 4, 6, 20, 8, 31)
        assert sighting.last_seen == datetime(2016, 4, 6, 20, 9, 31)
        assert sighting.count == 1
        assert sighting.where_sighted_refs == [IDENTITY_ID]
        assert sighting.created_by_ref == IDENTITY_ID
        assert sighting.summary is True
        assert sighting.tlp_v2_rating == TLPv2.CLEAR
        assert sighting.confidence == 90
        assert sighting.labels == ["aaa", "bbb"]
        assert sighting.revoked is True


class TestUnstructureToDict:
    def test_maximal_object_to_dict(self):
        sighting = sample_maximal_sighting_object()

        as_dict = sighting_converter.unstructure(sighting)

        assert as_dict["sighting_id"].startswith("sighting--")
        assert as_dict["sighting_of_ref"] == INDICATOR_ID
        assert as_dict["where_sighted_refs"] == [IDENTITY_ID]
        assert as_dict["created_by_ref"] == IDENTITY_ID
        assert as_dict["description"] == "Test sighting"
        assert as_dict["first_seen"] == "2024-01-01T12:00:00"
        assert as_dict["last_seen"] == "2024-01-02T13:00:00"
        assert as_dict["count"] == 5
        assert as_dict["tlp_v2_rating"] == "TLP:GREEN"
        assert as_dict["confidence"] == 75
        assert as_dict["summary"] is False
        assert as_dict["labels"] == ["ccc", "ddd"]
        assert as_dict["revoked"] is False
        assert isinstance(as_dict["created"], str)
        assert isinstance(as_dict["modified"], str)


class TestValidators:
    @pytest.mark.parametrize("confidence_value", [0, 10, 50, 100])
    def test_valid_confidence_values(self, confidence_value):
        sighting = SightingModelV1(
            sighting_of_ref=INDICATOR_ID,
            description="Test",
            tlp_v2_rating=TLPv2.CLEAR,
            confidence=confidence_value,
        )
        assert sighting.confidence == confidence_value

    @pytest.mark.parametrize("confidence_value", [-1, 101])
    def test_invalid_confidence_values(self, confidence_value):
        with pytest.raises(ValueError):
            SightingModelV1(
                sighting_of_ref=INDICATOR_ID,
                description="Test",
                tlp_v2_rating=TLPv2.CLEAR,
                confidence=confidence_value,
            )

    def test_validate_sighting_id_invalid(self):
        with pytest.raises(ValueError) as exc_info:
            SightingModelV1(
                sighting_id="not-valid-id",
                sighting_of_ref=INDICATOR_ID,
                description="Test",
                tlp_v2_rating=TLPv2.CLEAR,
            )
        assert "Invalid sighting_id" in str(exc_info.value)

    def test_validate_sighting_of_ref_empty(self):
        with pytest.raises(ValueError) as exc_info:
            SightingModelV1(
                sighting_of_ref="",
                description="Test",
                tlp_v2_rating=TLPv2.CLEAR,
            )
        assert "sighting_of_ref must be provided" in str(exc_info.value)

    def test_validate_sighting_of_ref_invalid_format(self):
        with pytest.raises(ValueError) as exc_info:
            SightingModelV1(
                sighting_of_ref="invalid-no-double-dash",
                description="Test",
                tlp_v2_rating=TLPv2.CLEAR,
            )
        assert "sighting_of_ref must be a valid STIX indicator identifier" in str(exc_info.value)

    def test_validate_count_negative(self):
        with pytest.raises(ValueError) as exc_info:
            SightingModelV1(
                sighting_of_ref=INDICATOR_ID,
                description="Test",
                count=-1,
                tlp_v2_rating=TLPv2.CLEAR,
            )
        assert exc_info.type is ValueError

    def test_validate_temporal_order_first_after_last(self):
        with pytest.raises(ValueError) as exc_info:
            SightingModelV1(
                sighting_of_ref=INDICATOR_ID,
                description="Bad temporal order",
                first_seen=datetime(2024, 1, 2, 12, 0, 0),
                last_seen=datetime(2024, 1, 1, 12, 0, 0),
                tlp_v2_rating=TLPv2.CLEAR,
            )
        assert "first_seen must be <= last_seen" in str(exc_info.value)

    def test_validate_temporal_order_valid(self):
        sighting = SightingModelV1(
            sighting_of_ref=INDICATOR_ID,
            description="Valid temporal order",
            first_seen=datetime(2024, 1, 1, 12, 0, 0),
            last_seen=datetime(2024, 1, 2, 12, 0, 0),
            tlp_v2_rating=TLPv2.CLEAR,
        )
        assert sighting.first_seen <= sighting.last_seen

    def test_validate_where_sighted_refs_invalid_format(self):
        with pytest.raises(ValueError) as exc_info:
            SightingModelV1(
                sighting_of_ref=INDICATOR_ID,
                description="Test",
                where_sighted_refs=["invalid-format"],
                tlp_v2_rating=TLPv2.CLEAR,
            )
        assert "Invalid STIX identifier" in str(exc_info.value)


class TestConvertToStix2Object:
    def test_to_stix_minimal_example(self):
        sighting = SightingModelV1(
            sighting_of_ref=INDICATOR_ID,
            sighting_id=SIGHTING_ID_1,
        )
        stix_obj = sighting.to_stix()
        assert stix_obj.id == sighting.sighting_id
        assert stix_obj.sighting_of_ref == sighting.sighting_of_ref

    def test_to_stix_maximal_example(self):
        sighting = sample_maximal_sighting_object()
        assert sighting.tlp_v2_rating == TLPv2.GREEN
        stix_obj = sighting.to_stix()

        assert stix_obj.id == sighting.sighting_id
        assert stix_obj.type == "sighting"
        assert stix_obj.sighting_of_ref == sighting.sighting_of_ref
        assert stix_obj.where_sighted_refs == sighting.where_sighted_refs
        assert stix_obj.description == sighting.description
        assert stix_obj.first_seen == sighting.first_seen
        assert stix_obj.last_seen == sighting.last_seen
        assert stix_obj.count == 5
        assert stix_obj.confidence == 75
        assert stix_obj.summary is False
        assert stix_obj.labels == ["ccc", "ddd"]
        assert stix_obj.revoked is False

        # Marking definition for TLPv2 GREEN
        assert stix_obj.object_marking_refs == [GREEN_MARKING_DEFINITION.id]
