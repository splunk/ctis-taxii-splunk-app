from .util import create_new_identity, get_identities_collection, list_identities


class TestScenarios:
    def test_add_new_indicator_writes_to_db(self, session, cleanup_identities_collection):
        identities = get_identities_collection(session)
        assert len(identities) == 0

        create_new_identity(session, {"name": "test_identity", "identity_class" : "organization"})

        identities = get_identities_collection(session)
        assert len(identities) == 1
        identity = identities[0]
        assert identity["name"] == "test_identity"
        assert identity["identity_class"] == "organization"
        assert "identity_id" in identity

    def test_query_identities(self, session, cleanup_identities_collection):
        create_new_identity(session, {"name": "org1", "identity_class" : "organization"})
        create_new_identity(session, {"name": "org2", "identity_class" : "organization"})
        create_new_identity(session, {"name": "user1", "identity_class" : "individual"})
        identities = get_identities_collection(session)
        assert len(identities) == 3

        resp1 = list_identities(session, skip=0, limit=100)
        assert resp1["total"] == 3
        assert len(resp1["records"]) == 3

        resp2 = list_identities(session, skip=0, limit=100, query={"identity_class": "organization"})
        assert resp2["total"] == 2
        assert len(resp2["records"]) == 2

