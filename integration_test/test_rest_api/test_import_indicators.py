import pytest
import requests

from util import import_stix_indicators
from .util import (
    create_new_indicator,
    validate_stix_indicators,
    example_stix_indicator,
    get_indicators_collection,
    new_sample_grouping,
    create_indicator_form_payload
)

"""
Integration test coverage for the POST import-stix endpoint.
This endpoint accepts a JSON object body.
In the JSON payload, the "action" can either be "validate" or "import".

"""

class TestValidateMode:
    def test_stix_indicator_missing_pattern_throws_error(self, session, cleanup_all_collections):
        """
        Test that validation rejects STIX indicators missing required 'pattern' field.

        The endpoint should return HTTP 400 with an error message indicating
        the missing field.
        """
        # Create a STIX indicator missing the required 'pattern' field
        invalid_stix_indicator = {
            "spec_version": "2.1",
            "type": "indicator",
            "id": "indicator--c1e4f15d-cb46-496c-b50e-c24efdf7c90e",
            "pattern_type": "stix",
            # "pattern" field is intentionally missing
            "created": "2026-07-17T01:02:03.456Z",
            "modified": "2026-07-18T10:00:01.000Z",
            "valid_from": "2026-07-17T00:11:22.000Z"
        }

        # Attempt to validate the invalid indicator
        # Should raise HTTPError with 400 status code
        with pytest.raises(requests.HTTPError) as excinfo:
            validate_stix_indicators(session=session, indicators=[invalid_stix_indicator])

        # Verify it's a 400 error
        assert excinfo.value.response.status_code == 400

        # Verify the error message mentions the missing field
        response_content = excinfo.value.response.text
        assert "missing required field 'pattern'" in response_content.lower()

    def test_existing_indicator_ids_are_returned(self, session, cleanup_all_collections):
        """
        This test should create one Indicator and then POST to import-stix like so:
        {
            "action": "validate",
            "model_type": "indicator",
            "stix_objects": [...]
        }
        stix_objects should contain an indicator which has "id" equal to the previously created indicator.

        Expecting HTTP 200
        The response should be a JSON object with a key "existing_ids" that contains a list of existing indicator IDs.
        :return:
        """
        # Create a grouping and indicator in the database
        grouping = new_sample_grouping(session)
        payload = create_indicator_form_payload(
            grouping_id=grouping["grouping_id"],
            indicators=[{
                "splunk_field_name": "src_ip",
                "indicator_value": "192.168.1.1",
                "indicator_category": "source_ipv4",
                "stix_pattern": "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '192.168.1.1']",
                "name": "Test Indicator",
                "description": "Test indicator for validation",
            }]
        )
        create_new_indicator(session, payload=payload)

        # Get the created indicator's ID
        indicators = get_indicators_collection(session)
        assert len(indicators) == 1
        existing_indicator_id = indicators[0]["indicator_id"]
        assert existing_indicator_id.startswith("indicator--")

        # Create STIX objects - one existing, one new
        stix_indicators = [
            example_stix_indicator(indicator_id=existing_indicator_id),  # This one exists
            example_stix_indicator()  # This one is new
        ]

        # Call the validate endpoint
        response = validate_stix_indicators(session=session, indicators=stix_indicators)

        # Verify the response structure
        assert "existing_ids" in response
        existing_ids = response["existing_ids"]

        # Should contain exactly one ID (the existing one)
        assert len(existing_ids) == 1
        assert existing_ids[0] == existing_indicator_id

class TestImportMode:
    """
    Coverage for the endpoint `POST import-stix` with action="import".

    Example JSON payload:
    {
      "action": "import",
      "model_type": "indicator",
      "new_grouping": {
        "created_by_ref": "identity--0bb7b04a-865b-4cd9-87e2-6614c8d5d001",
        "context": "unspecified",
        "name": "Imported",
        "description": "Imported",
        "tlp_v2_rating": "TLP:CLEAR"
      },
      "overwrite_existing": true,
      "stix_objects": [
        {
          "type": "indicator",
          "spec_version": "2.1",
          "id": "indicator--5f13c5fd-b2a5-4efa-b834-bf057627cad1",
          "created_by_ref": "identity--9325530c-b4a5-4078-8a4e-67b0f097e765",
          "created": "2026-07-22T05:23:43.847817Z",
          "modified": "2026-07-22T05:23:43.847817Z",
          "name": "blue elephant io 2",
          "pattern": "[url:value = 'https://blue.elephant.io.2']",
          "pattern_type": "stix",
          "pattern_version": "2.1",
          "valid_from": "2026-07-22T05:23:43.847817Z",
          "labels": [
            "mock-data"
          ],
          "object_marking_refs": [
            "marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487"
          ],
          "confidence": 24
        },
        {
          "type": "indicator",
          "spec_version": "2.1",
          "id": "indicator--da720eb1-fdc6-4163-b6d7-9e253afdaffe",
          "created_by_ref": "identity--9325530c-b4a5-4078-8a4e-67b0f097e765",
          "created": "2026-07-22T05:23:43.850621Z",
          "modified": "2026-07-22T05:23:43.850621Z",
          "name": "violet eagle com",
          "pattern": "[url:value = 'https://violet.eagle.com']",
          "pattern_type": "stix",
          "pattern_version": "2.1",
          "valid_from": "2026-07-22T05:23:43.850621Z",
          "valid_until": "2026-07-23T01:02:03Z",
          "object_marking_refs": [
            "marking-definition--e828b379-4e03-4974-9ac4-e53a884c97c1"
          ],
          "confidence": 16
        }
      ]
    }
    """

    def test_should_overwrite_existing_indicators(self, session, cleanup_all_collections):
        """
        Create 1 existing indicator via REST.

        Generate 2 new STIX 2.1 indicators: one with the same ID as the existing indicator,
        and one with a new ID.

        The POST request to import-stix should have JSON body with overwrite_existing=true

        Assert that 2 indicators are written to the Indicators collection: the existing indicator
        is overwritten with the new STIX object, and 1 new indicator is added.
        """
        grouping_1 = new_sample_grouping(session, grouping_name="grouping-1", identity_name="identity-1")
        new_identity_id = grouping_1['created_by_ref']
        payload = create_indicator_form_payload(
            grouping_id=grouping_1["grouping_id"],
            indicators=[{
                "splunk_field_name": "src_ip",
                "indicator_value": "192.168.1.1",
                "indicator_category": "source_ipv4",
                "stix_pattern": "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '192.168.1.1']",
                "name": "Existing Indicator",
                "description": "This indicator will be overwritten",
            }]
        )
        create_new_indicator(session, payload=payload)

        # Get the created indicator's ID
        indicators_before = get_indicators_collection(session)
        assert len(indicators_before) == 1
        existing_indicator_id = indicators_before[0]["indicator_id"]
        assert existing_indicator_id.startswith("indicator--")

        stix_indicator_overwrite = example_stix_indicator(indicator_id=existing_indicator_id)
        stix_indicator_overwrite["name"] = "Overwritten Indicator"
        stix_indicator_overwrite["pattern"] = "[url:value = 'https://overwritten-indicator.com']"

        stix_indicator_new = example_stix_indicator()
        stix_indicator_new["name"] = "New Indicator"

        response = import_stix_indicators(session=session, indicators=[stix_indicator_overwrite, stix_indicator_new], new_grouping={
            "created_by_ref": new_identity_id,
            "context": 'unspecified',
            "name": 'Imported Indicators',
            "description": 'Imported Indicators',
            "tlp_v2_rating": 'TLP:CLEAR'
        }, overwrite_existing=True)

        assert "new_grouping" in response
        assert "indicators" in response
        assert len(response["indicators"]) == 2

        indicators_after = get_indicators_collection(session)
        assert len(indicators_after) == 2

        for ind in indicators_after:
            if ind['indicator_id'] == existing_indicator_id:
                # Name should be updated
                assert ind['name'] == 'Overwritten Indicator'
                break
