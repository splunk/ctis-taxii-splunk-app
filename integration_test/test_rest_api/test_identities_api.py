from .util import create_new_identity, get_identities_collection


class TestScenarios:
    def test_scenario_add_new_indicator_writes_to_db(self, session, cleanup_identities_collection):
        identities = get_identities_collection(session)
        assert len(identities) == 0

        create_new_identity(session, {"name": "test_identity", "identity_class" : "organization"})

        identities = get_identities_collection(session)
        assert len(identities) == 1
        identity = identities[0]
        assert identity["name"] == "test_identity"
        assert identity["identity_class"] == "organization"
        assert "identity_id" in identity
