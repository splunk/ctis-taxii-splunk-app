import pytest
import requests

from .util import create_new_grouping, get_groupings_collection, create_new_identity, get_identities_collection


class TestScenarios:
    def test_add_new_grouping(self, session, cleanup_identities_collection, cleanup_groupings_collection):
        assert len(get_groupings_collection(session)) == 0
        assert len(get_identities_collection(session)) == 0

        resp = create_new_identity(session, {
            "name" : "identity-1",
            "identity_class" : "organization",
        })
        identity = resp["identity"]
        assert identity["name"] == "identity-1"

        create_new_grouping(session, {
            "created_by_ref": identity["identity_id"],
            "name": "grouping-1",
            "description": "description-1",
            "context" : "unspecified",
        })

        groupings = get_groupings_collection(session)
        assert len(groupings) == 1
        grouping_saved = groupings[0]
        assert grouping_saved["created_by_ref"] == identity["identity_id"]
        assert grouping_saved["name"] == "grouping-1"
        assert grouping_saved["description"] == "description-1"
        assert grouping_saved["context"] == "unspecified"

    def test_add_grouping_should_validate_created_by_ref_exists(self, session, cleanup_identities_collection, cleanup_groupings_collection):
        assert len(get_groupings_collection(session)) == 0
        assert len(get_identities_collection(session)) == 0

        with pytest.raises(requests.exceptions.HTTPError) as excinfo:
            create_new_grouping(session, {
                "created_by_ref": "identity--127d041b-fe07-44ec-bc98-6f1e36b3776d",
                "name": "grouping-1",
                "description": "description-1",
                "context" : "unspecified",
            })
        assert excinfo.value.response.status_code == 400
