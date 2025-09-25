"""
TODO:
- Create fixture to spin up and tear down the TAXII server using the script provided.
- Given Splunk host and credentials, and that the CTIS app is installed....
- Create a new TAXII config in the app via a POST request:

POST https://localhost:8089/servicesNS/-/TA_CTIS_TAXII/TA_CTIS_TAXII_taxii_config?output_mode=json
Using x-www-form-urlencoded body with fields:
name, api_root_url, username, password.

- Create an identity
- Create a grouping
- Create an indicator which references the identity and grouping created
- Get preview of STIX bundle JSON for grouping via API
- Submit STIX bundle to TAXII server via API
"""
import json

from util import example_indicator, new_sample_grouping, create_new_indicator, create_indicator_form_payload, post_submit_grouping_to_taxii_server
import logging

logger = logging.getLogger(__name__)

class TestTaxiiServerConnection:
    def test_taxii_server_discovery(self, taxii2_server, taxii2_server_session, taxii2_server_is_reachable):
        resp = taxii2_server_session.get(taxii2_server.server_discovery_url)
        resp.raise_for_status()
        print(resp.json())

    def test_list_collections_for_default_api_root(self, taxii2_server, taxii2_server_session, taxii2_server_is_reachable):
        resp = taxii2_server_session.get(f"{taxii2_server.default_api_root_url}/collections")
        resp.raise_for_status()
        print(resp.json())


class TestStixBundleSubmission:
    def test_end_to_end(self, session, taxii2_server, ctis_app_taxii_config, testing_context_id):
        print(ctis_app_taxii_config)
        grouping = new_sample_grouping(session=session, identity_name=f"{testing_context_id}_identity", grouping_name=f"{testing_context_id}_grouping")
        print(grouping)

        grouping_id = grouping["grouping_id"]
        logger.info(f"Created grouping with ID: {grouping_id}")

        indicator = example_indicator()
        create_indicators_payload = create_indicator_form_payload(grouping_id=grouping_id, indicators=[indicator])
        create_indicators_resp = create_new_indicator(session, payload=create_indicators_payload)
        print(create_indicators_resp)
        logger.info(f"Created indicator: {create_indicators_resp}")

        logger.info("Submitting bundle/grouping to TAXII server...")
        submission_resp = post_submit_grouping_to_taxii_server(session=session,
                                             grouping_id=grouping_id,
                                             taxii_config_name=ctis_app_taxii_config,
                                             taxii_collection_id=taxii2_server.readable_and_writable_collection_id)
        logger.info(f"Submission response: {submission_resp}")
        submission_resp_obj = submission_resp["submission"]
        assert submission_resp_obj["status"] == "SENT"
        assert submission_resp_obj["grouping_id"] == grouping_id
        assert submission_resp_obj["taxii_config_name"] == ctis_app_taxii_config

        taxii_server_resp_json = submission_resp_obj["response_json"]
        taxii_server_resp_obj = json.loads(taxii_server_resp_json)
        assert taxii_server_resp_obj["status"] == "complete"

class TestCrudOperationsOnScheduledSubmission:
    def test_create_scheduled_submission(self):
        raise NotImplementedError

    def test_unschedule_scheduled_submission(self):
        raise NotImplementedError

    def test_edit_scheduled_submission(self):
        # Edit the scheduled time of the submission
        raise NotImplementedError

    def test_list_submissions(self):
        raise NotImplementedError

