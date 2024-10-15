from concurrent.futures.thread import ThreadPoolExecutor

import pytest
import requests

from .util import create_new_grouping, edit_grouping, get_groupings_collection, create_new_identity, \
    get_identities_collection, list_groupings, delete_grouping, create_new_indicator, get_indicators_collection


class TestScenarios:
    @pytest.mark.skip(reason="This test is only used for manual testing")
    def test_add_bulk_groupings(self, session, cleanup_identities_collection, cleanup_groupings_collection):
        assert len(get_groupings_collection(session)) == 0
        assert len(get_identities_collection(session)) == 0

        resp = create_new_identity(session, {
            "name": "identity-1",
            "identity_class": "organization",
        })
        identity = resp["identity"]
        assert identity["name"] == "identity-1"

        with ThreadPoolExecutor(max_workers=10) as executor:
            for i in range(1000):
                executor.submit(create_new_grouping, session, {
                    "created_by_ref": identity["identity_id"],
                    "name": f"grouping-{i}",
                    "description": f"description for grouping {i}",
                    "context": "unspecified",
                })

        groupings = get_groupings_collection(session)
        assert len(groupings) == 1000

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

    def test_list_groupings(self, session, cleanup_groupings_collection, cleanup_identities_collection):
        assert len(get_groupings_collection(session)) == 0
        listed_groupings = list_groupings(session=session, skip=0, limit=0)
        assert len(listed_groupings['records']) == 0

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

        create_new_grouping(session, {
            "created_by_ref": identity["identity_id"],
            "name": "grouping-2",
            "description": "description-2",
            "context" : "unspecified",
        })

        listed_groupings_2 = list_groupings(session=session, skip=0, limit=0)
        assert len(listed_groupings_2['records']) == 2
        assert set([x["name"] for x in listed_groupings_2['records']]) == {"grouping-1", "grouping-2"}

        listed_groupings_3 = list_groupings(session=session, skip=0, limit=1)
        assert len(listed_groupings_3['records']) == 1
        assert listed_groupings_3['total'] == 2

    def test_edit_grouping(self, session, cleanup_groupings_collection, cleanup_identities_collection):
        assert len(get_groupings_collection(session)) == 0
        resp = create_new_identity(session, {
            "name": "identity-1",
            "identity_class": "organization",
        })
        identity = resp["identity"]
        assert identity["name"] == "identity-1"
        create_new_grouping(session, {
            "created_by_ref": identity["identity_id"],
            "name": "grouping-1",
            "description": "description-1",
            "context": "unspecified",
        })
        groupings_1 = get_groupings_collection(session)
        assert len(groupings_1) == 1
        assert groupings_1[0]["created_by_ref"] == identity["identity_id"]
        assert groupings_1[0]["name"] == "grouping-1"

        edit_grouping(session, {
            "grouping_id": groupings_1[0]["grouping_id"],
            "name": "grouping-a",
        })

        groupings_2 = get_groupings_collection(session)
        assert len(groupings_2) == 1
        assert groupings_2[0]["name"] == "grouping-a"

    def test_delete_grouping(self, session, cleanup_groupings_collection, cleanup_identities_collection):
        assert len(get_groupings_collection(session)) == 0
        assert len(get_identities_collection(session)) == 0

        resp = create_new_identity(session, {
            "name": "identity-1",
            "identity_class": "organization",
        })
        identity = resp["identity"]
        assert identity["name"] == "identity-1"
        create_new_grouping(session, {
            "created_by_ref": identity["identity_id"],
            "name": "grouping-1",
            "description": "description-1",
            "context": "unspecified",
        })
        groupings_1 = get_groupings_collection(session)
        assert len(groupings_1) == 1
        assert groupings_1[0]["created_by_ref"] == identity["identity_id"]
        assert groupings_1[0]["name"] == "grouping-1"

        delete_grouping(session, grouping_id=groupings_1[0]["grouping_id"])

        groupings_2 = get_groupings_collection(session)
        assert len(groupings_2) == 0

    def test_list_groupings_should_include_indicators(self, session, cleanup_groupings_collection, cleanup_identities_collection, cleanup_indicators_collection):
        assert len(get_groupings_collection(session)) == 0
        assert len(get_identities_collection(session)) == 0
        assert len(get_indicators_collection(session)) == 0

        identity = create_new_identity(session, {
            "name": "identity-1",
            "identity_class": "organization",
        })["identity"]

        grouping = create_new_grouping(session, {
            "created_by_ref": identity["identity_id"],
            "name": "grouping-1",
            "description": "description-1",
            "context": "unspecified",
        })["grouping"]
        assert grouping["grouping_id"] is not None

        indicators_resp = create_new_indicator(session, {
            "grouping_id": grouping["grouping_id"],
            "confidence": 100,
            "tlp_v2_rating": "TLP:GREEN",
            "valid_from": "2024-09-03T22:51:44.361",
            "indicators": [
                {
                    "field_name": "",
                    "indicator_value": "123.456.1.2",
                    "indicator_category": "source_ipv4",
                    "stix_pattern": "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '123.456.1.2']",
                    "name": "asdf",
                    "description": "adsf"
                }
            ]
        })
        indicator = indicators_resp["indicators"][0]
        assert indicator["indicator_id"] is not None
        assert indicator["grouping_id"] == grouping["grouping_id"]

        groupings = list_groupings(session=session, skip=0, limit=0)
        assert len(groupings['records']) == 1
        first_grouping = groupings['records'][0]
        assert first_grouping["indicators"] == [indicator["indicator_id"]]
