from .util import create_new_identity, example_stix_identity, get_identities_collection, validate_stix_identities


"""
These tests should hit endpoint `POST import-stix`.
Similar to test_import_indicators.py

In validate mode (action="validate"), an array of existing identity IDs should be returned that overlap with the given stix identity objects.

A sample request payload looks like:

{
  "action": "validate",
  "model_type": "identity",
  "stix_objects" : [
    {
        "type": "identity",
        "spec_version": "2.1",
        "id": "identity--023d105b-752e-4e3c-941c-7d3f3cb15e9e",
        "created": "2016-04-06T20:03:00.000Z",
        "modified": "2016-04-06T20:03:00.000Z",
        "name": "John Smith"
    }
  ]
}

In import mode (action="import"), the identities are parsed and written to the identities KV Store Collection.

A sample request payload looks like:
{
  "action": "import",
  "model_type": "identity",
  "overwrite_existing": true,
  "stix_objects" : [
    {
        "id": "identity--f664d4bd-096d-43c1-804a-fa95e23dc556",
        "type": "identity",
        "spec_version": "2.1",
        "name": "Charlie",
        "created": "2025-03-27T09:12:14.123Z",
        "modified": "2025-03-27T10:11:12.678Z",
        "identity_class": "individual",
        "confidence": 49,
        "object_marking_refs": [
            "marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487"
        ]
    },
    {
        "id": "identity--f664d4bd-096d-43c1-804a-fa95e23dc123",
        "type": "identity",
        "spec_version": "2.1",
        "name": "ABC",
        "created": "2025-03-27T09:12:14.123Z",
        "modified": "2025-03-27T10:11:12.678Z",
        "identity_class": "organization",
        "confidence": 99,
        "object_marking_refs": [
            "marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487"
        ]
    }
  ]
}

"""
class TestValidateMode:
    def test_existing_identity_ids_are_returned(self, session, cleanup_all_collections):
        """
        This test should:
        1. Create 2 identity records: A and B.
        2. Request `POST import-stix` in validate mode with 2 STIX 2.1 identity objects, one of which has the same "id"
        as record B.
        3. Verify that the response is a JSON object with a top level array called "existing_ids".
        4. Verify that the "existing_ids" array has only 1 identity ID, which should be the "id" of record B.
        """
        identity_a_id = "identity--e24857ca-034d-43c1-9e32-bc42a0f00e01"
        identity_b_id = "identity--c31eb6d7-bca0-4e7c-9f82-bf234f4ba002"

        create_new_identity(session, {
            "name": "Identity A",
            "identity_class": "organization",
            "identity_id": identity_a_id,
            "confidence": 50,
            "tlp_v2_rating": "TLP:GREEN",
        })
        create_new_identity(session, {
            "name": "Identity B",
            "identity_class": "individual",
            "identity_id": identity_b_id,
            "confidence": 75,
            "tlp_v2_rating": "TLP:GREEN",
        })

        identities = get_identities_collection(session)
        assert len(identities) == 2

        response = validate_stix_identities(session=session, identities=[
            example_stix_identity(identity_id=identity_b_id, name="Existing Identity B", identity_class="individual"),
            example_stix_identity(name="New Identity C", identity_class="organization"),
        ])

        assert "existing_ids" in response
        existing_ids = response["existing_ids"]
        assert len(existing_ids) == 1
        assert existing_ids[0] == identity_b_id

class TestImportMode:
    def test_import(self, session, cleanup_all_collections):
        """
        This test should

        """
        raise NotImplementedError
