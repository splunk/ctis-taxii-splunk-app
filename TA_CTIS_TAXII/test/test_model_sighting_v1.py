from datetime import datetime
import pytest

from TA_CTIS_TAXII.package.bin.models import SightingModelV1, sighting_converter, TLPv2
from TA_CTIS_TAXII.package.bin.models.tlp_v2 import CLEAR_MARKING_DEFINITION, GREEN_MARKING_DEFINITION, AMBER_MARKING_DEFINITION, RED_MARKING_DEFINITION

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
        "sighting_of_ref": INDICATOR_ID
    }


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





def test_unstructure_to_dict():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Test sighting",
        first_seen=datetime(2024, 1, 1, 12, 0, 0),
        last_seen=datetime(2024, 1, 2, 12, 0, 0),
        count=5,
        tlp_v2_rating=TLPv2.GREEN,
        confidence=75,
        summary=True,
    )

    as_dict = sighting_converter.unstructure(sighting)

    assert as_dict["sighting_id"].startswith("sighting--")
    assert as_dict["sighting_of_ref"] == INDICATOR_ID
    assert as_dict["description"] == "Test sighting"
    assert as_dict["first_seen"] == "2024-01-01T12:00:00"
    assert as_dict["last_seen"] == "2024-01-02T12:00:00"
    assert as_dict["count"] == 5
    assert as_dict["tlp_v2_rating"] == "TLP:GREEN"
    assert as_dict["confidence"] == 75
    assert as_dict["summary"] is True


def test_structure_unstructure_roundtrip():
    original_dict = sample_minimal_sighting_dict_with_sighting_id()
    sighting = sighting_converter.structure(original_dict, SightingModelV1)
    result_dict = sighting_converter.unstructure(sighting)

    assert result_dict["sighting_of_ref"] == original_dict["sighting_of_ref"]
    assert result_dict["description"] == original_dict["description"]
    assert result_dict["count"] == original_dict["count"]
    assert result_dict["confidence"] == original_dict["confidence"]


# B. Validator Tests

def test_validate_sighting_id_invalid():
    with pytest.raises(ValueError) as exc_info:
        SightingModelV1(
            sighting_id="not-valid-id",
            sighting_of_ref=INDICATOR_ID,
            description="Test",
            tlp_v2_rating=TLPv2.CLEAR,
        )
    assert "Invalid sighting_id" in str(exc_info.value)


def test_validate_sighting_of_ref_empty():
    with pytest.raises(ValueError) as exc_info:
        SightingModelV1(
            sighting_of_ref="",
            description="Test",
            tlp_v2_rating=TLPv2.CLEAR,
        )
    assert "sighting_of_ref must be provided" in str(exc_info.value)


def test_validate_sighting_of_ref_invalid_format():
    with pytest.raises(ValueError) as exc_info:
        SightingModelV1(
            sighting_of_ref="invalid-no-double-dash",
            description="Test",
            tlp_v2_rating=TLPv2.CLEAR,
        )
    assert "must be a valid STIX identifier" in str(exc_info.value)


def test_validate_count_negative():
    with pytest.raises(ValueError) as exc_info:
        SightingModelV1(
            sighting_of_ref=INDICATOR_ID,
            description="Test",
            count=0,
            tlp_v2_rating=TLPv2.CLEAR,
        )
    assert "count must be >= 1" in str(exc_info.value)


def test_validate_count_positive():
    sighting1 = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Test",
        count=1,
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert sighting1.count == 1

    sighting5 = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Test",
        count=5,
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert sighting5.count == 5


def test_validate_temporal_order_first_after_last():
    with pytest.raises(ValueError) as exc_info:
        SightingModelV1(
            sighting_of_ref=INDICATOR_ID,
            description="Bad temporal order",
            first_seen=datetime(2024, 1, 2, 12, 0, 0),
            last_seen=datetime(2024, 1, 1, 12, 0, 0),
            tlp_v2_rating=TLPv2.CLEAR,
        )
    assert "first_seen must be <= last_seen" in str(exc_info.value)


def test_validate_temporal_order_valid():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Valid temporal order",
        first_seen=datetime(2024, 1, 1, 12, 0, 0),
        last_seen=datetime(2024, 1, 2, 12, 0, 0),
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert sighting.first_seen <= sighting.last_seen


def test_validate_where_sighted_refs_invalid_format():
    with pytest.raises(ValueError) as exc_info:
        SightingModelV1(
            sighting_of_ref=INDICATOR_ID,
            description="Test",
            where_sighted_refs=["invalid-format"],
            tlp_v2_rating=TLPv2.CLEAR,
        )
    assert "Invalid STIX identifier" in str(exc_info.value)


def test_validate_where_sighted_refs_valid():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Test",
        where_sighted_refs=[IDENTITY_ID, "location--aaaaaaaa-1234-1234-1234-123456789012"],
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert len(sighting.where_sighted_refs) == 2


# C. STIX Conversion Tests

def test_to_stix_minimal():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Minimal sighting",
        tlp_v2_rating=TLPv2.CLEAR,
    )

    stix_obj = sighting.to_stix(created_by_ref=IDENTITY_ID)

    assert stix_obj.type == "sighting"
    assert stix_obj.id == sighting.sighting_id
    assert stix_obj.sighting_of_ref == INDICATOR_ID
    assert stix_obj.created_by_ref == IDENTITY_ID
    assert stix_obj.object_marking_refs == [CLEAR_MARKING_DEFINITION.id]
    assert stix_obj.confidence == 100
    assert stix_obj.summary is False


def test_to_stix_with_all_fields():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Complete sighting",
        first_seen=datetime(2024, 1, 1, 12, 0, 0),
        last_seen=datetime(2024, 1, 2, 12, 0, 0),
        count=10,
        where_sighted_refs=[IDENTITY_ID],
        summary=True,
        tlp_v2_rating=TLPv2.AMBER,
        confidence=85,
    )

    stix_obj = sighting.to_stix(created_by_ref=IDENTITY_ID)

    assert stix_obj.type == "sighting"
    assert stix_obj.description == "Complete sighting"
    assert stix_obj.first_seen == datetime(2024, 1, 1, 12, 0, 0)
    assert stix_obj.last_seen == datetime(2024, 1, 2, 12, 0, 0)
    assert stix_obj.count == 10
    assert stix_obj.where_sighted_refs == [IDENTITY_ID]
    assert stix_obj.summary is True
    assert stix_obj.confidence == 85


def test_to_stix_without_created_by_ref():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="No creator",
        tlp_v2_rating=TLPv2.CLEAR,
    )

    stix_obj = sighting.to_stix()

    assert stix_obj.type == "sighting"
    assert not hasattr(stix_obj, "created_by_ref") or stix_obj.created_by_ref is None


def test_to_stix_tlp_marking():
    test_cases = [
        (TLPv2.CLEAR, CLEAR_MARKING_DEFINITION.id),
        (TLPv2.GREEN, GREEN_MARKING_DEFINITION.id),
        (TLPv2.AMBER, AMBER_MARKING_DEFINITION.id),
        (TLPv2.RED, RED_MARKING_DEFINITION.id),
    ]

    for tlp_rating, expected_marking_id in test_cases:
        sighting = SightingModelV1(
            sighting_of_ref=INDICATOR_ID,
            description="TLP test",
            tlp_v2_rating=tlp_rating,
        )
        stix_obj = sighting.to_stix()
        assert stix_obj.object_marking_refs == [expected_marking_id]


# D. Edge Case Tests

@pytest.mark.parametrize("confidence_value,should_pass", [
    (0, True),
    (50, True),
    (100, True),
    (-1, False),
    (101, False),
])
def test_confidence_boundaries(confidence_value, should_pass):
    if should_pass:
        sighting = SightingModelV1(
            sighting_of_ref=INDICATOR_ID,
            description="Test",
            tlp_v2_rating=TLPv2.CLEAR,
            confidence=confidence_value,
        )
        assert sighting.confidence == confidence_value
    else:
        with pytest.raises(ValueError):
            SightingModelV1(
                sighting_of_ref=INDICATOR_ID,
                description="Test",
                tlp_v2_rating=TLPv2.CLEAR,
                confidence=confidence_value,
            )


def test_count_none_allowed():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="No count",
        count=None,
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert sighting.count is None


def test_temporal_fields_none_allowed():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="No temporal fields",
        first_seen=None,
        last_seen=None,
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert sighting.first_seen is None
    assert sighting.last_seen is None


def test_temporal_only_first_seen():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Only first_seen",
        first_seen=datetime(2024, 1, 1, 12, 0, 0),
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert sighting.first_seen == datetime(2024, 1, 1, 12, 0, 0)
    assert sighting.last_seen is None


def test_temporal_only_last_seen():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Only last_seen",
        last_seen=datetime(2024, 1, 2, 12, 0, 0),
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert sighting.first_seen is None
    assert sighting.last_seen == datetime(2024, 1, 2, 12, 0, 0)


def test_summary_default_false():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Default summary",
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert sighting.summary is False


def test_auto_generate_timestamps():
    sighting = SightingModelV1(
        sighting_of_ref=INDICATOR_ID,
        description="Auto timestamps",
        tlp_v2_rating=TLPv2.CLEAR,
    )
    assert type(sighting.created) is datetime
    assert type(sighting.modified) is datetime
    assert sighting.created is not None
    assert sighting.modified is not None
