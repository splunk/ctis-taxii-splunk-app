from datetime import datetime

from TA_CTIS_TAXII.package.bin.models import IdentityModelV1, TLPv2


def test_parse_minimal_sample():
    stix_identity = {
        "type": "identity",
        "spec_version": "2.1",
        "id": "identity--023d105b-752e-4e3c-941c-7d3f3cb15e9e",
        "created": "2016-04-06T20:03:00.000Z",
        "modified": "2016-04-06T20:03:00.000Z",
        "name": "John Smith",
    }
    model = IdentityModelV1.from_stix(stix_object=stix_identity, default_tlp_v2_rating=TLPv2.CLEAR)
    assert model.tlp_v2_rating == TLPv2.CLEAR
    assert model.name == "John Smith"
    assert model.identity_id == stix_identity['id']

    assert model.created == datetime(2016, 4, 6, 20, 3, 0)
    assert model.modified == datetime(2016, 4, 6, 20, 3, 0)

    # Defaults
    assert model.confidence == 100
    assert model.identity_class == 'unknown'


def test_parse_full_sample():
    identity_id = "identity--3ed6e0dc-109f-447e-9f8e-603b0c1e3854"
    stix_identity = {
        "id": identity_id,
        "type": "identity",
        "spec_version": "2.1",
        "name": "Charlie",
        "created": "2025-03-27T09:12:14.123Z",
        "modified": "2025-03-27T10:11:12.678Z",
        "identity_class": "individual",
        "confidence": 50,
        "object_marking_refs": [
            "marking-definition--55d920b0-5e8b-4f79-9ee9-91f868d9b421"
        ]
    }
    model = IdentityModelV1.from_stix(stix_object=stix_identity)

    assert model.identity_id == identity_id
    assert model.name == "Charlie"
    assert model.identity_class == "individual"
    assert model.confidence == 50
    assert model.created == datetime(2025, 3, 27, 9, 12, 14, 123000)
    assert model.modified == datetime(2025, 3, 27, 10, 11, 12, 678000)
    assert model.tlp_v2_rating == TLPv2.AMBER
