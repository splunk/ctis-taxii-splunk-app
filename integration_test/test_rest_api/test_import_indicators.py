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
    def test_sitx_indicator_missing_pattern_throws_error(self, session, cleanup_all_collections):
        # Expecting HTTP 400
        pass

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
