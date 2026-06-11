import pytest
import requests

from util import create_new_identity, get_identities_collection, list_identities, edit_identity, delete_identity


def create_new_identity_with_defaults(session, name: str, identity_class: str,
                                      tlp_v2_rating: str = "TLP:GREEN") -> dict:
    return create_new_identity(session, {"name": name, "identity_class": identity_class,
                                         "confidence": 50, "tlp_v2_rating": tlp_v2_rating})

class TestScenarios:
    def test_add_new_identity_writes_to_db(self, session, cleanup_identities_collection):
        identities = get_identities_collection(session)
        assert len(identities) == 0

        create_new_identity_with_defaults(session, name="test_identity", identity_class="organization", tlp_v2_rating="TLP:GREEN")

        identities = get_identities_collection(session)
        assert len(identities) == 1
        identity = identities[0]
        assert identity["name"] == "test_identity"
        assert identity["identity_class"] == "organization"
        assert identity["confidence"] == 50
        assert identity["tlp_v2_rating"] == "TLP:GREEN"
        assert "identity_id" in identity

    def test_add_new_identity_with_specified_id(self, session, cleanup_identities_collection):
        user_specified_id =  "identity--ef308599-d00f-4bba-adc1-530d9267fe77"
        create_new_identity(session, {"name": "test_identity",
                                                 "identity_class": "organization",
                                                 "identity_id": user_specified_id,
                                                 "confidence": 50,
                                                 "tlp_v2_rating": "TLP:GREEN"})

        resp = list_identities(session, skip=0, limit=0, query={"identity_id": user_specified_id})
        assert resp["total"] == 1
        assert len(resp["records"]) == 1

        only_record = resp["records"][0]
        assert only_record["name"] == "test_identity"
        assert only_record["identity_id"] == user_specified_id

    def test_should_not_overwrite_existing_identity(self, session, cleanup_identities_collection):
        user_specified_id = "identity--dfba407a-655d-4fb6-9c3e-ecc933186df2"
        create_new_identity(session, {"name": "test_identity",
                                      "identity_class": "organization",
                                      "identity_id": user_specified_id,
                                      "confidence": 50,
                                      "tlp_v2_rating": "TLP:GREEN"})
        resp = list_identities(session, skip=0, limit=0, query={"identity_id": user_specified_id})
        assert resp["total"] == 1
        assert len(resp["records"]) == 1

        # should throw a Client error because record with identity_id already exists.
        with pytest.raises(requests.HTTPError) as excinfo:
            create_new_identity(session, {"name": "test_identity",
                                          "identity_class": "organization",
                                          "identity_id": user_specified_id,
                                          "confidence": 50,
                                          "tlp_v2_rating": "TLP:GREEN"})
        assert excinfo.value.response.status_code == 400
        assert 'already exists' in str(excinfo.value.response.content)


    def test_query_identities(self, session, cleanup_identities_collection):
        create_new_identity_with_defaults(session, name="org1", identity_class="organization")
        create_new_identity_with_defaults(session, name="org2", identity_class="organization")
        create_new_identity_with_defaults(session, name="user1", identity_class="individual")
        identities = get_identities_collection(session)
        assert len(identities) == 3

        resp1 = list_identities(session, skip=0, limit=100)
        assert resp1["total"] == 3
        assert len(resp1["records"]) == 3

        resp2 = list_identities(session, skip=0, limit=100, query={"identity_class": "organization"})
        assert resp2["total"] == 2
        assert len(resp2["records"]) == 2

        # Test pagination
        resp3 = list_identities(session, skip=0, limit=2)
        assert resp3["total"] == 3
        assert len(resp3["records"]) == 2

    def test_edit_identity(self, session, cleanup_identities_collection):
        create_new_identity_with_defaults(session, name="user1", identity_class="individual", tlp_v2_rating="TLP:GREEN")
        identities_1 = get_identities_collection(session)
        assert len(identities_1) == 1
        saved_identity_1 = identities_1[0]
        assert saved_identity_1["name"] == "user1"
        assert saved_identity_1["identity_class"] == "individual"
        assert saved_identity_1["tlp_v2_rating"] == "TLP:GREEN"

        edit_identity(session, {
            "identity_id": saved_identity_1["identity_id"],
            "name": "user2",
            "tlp_v2_rating": "TLP:RED"
        })

        identities_2 = get_identities_collection(session)
        assert len(identities_2) == 1
        saved_identity_2 = identities_2[0]
        assert saved_identity_2["name"] == "user2"
        assert saved_identity_2["identity_class"] == "individual"
        assert saved_identity_2["modified"] != saved_identity_1["modified"]
        assert saved_identity_2["tlp_v2_rating"] == "TLP:RED"

    def test_delete_identity(self, session, cleanup_identities_collection):
        create_new_identity_with_defaults(session, name="user1", identity_class="individual")
        identities_1 = get_identities_collection(session)
        assert len(identities_1) == 1
        identity = identities_1[0]

        delete_identity(session, identity["identity_id"])

        identities_2 = get_identities_collection(session)
        assert len(identities_2) == 0


