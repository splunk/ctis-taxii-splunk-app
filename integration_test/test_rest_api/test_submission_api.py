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
import logging
import time
from datetime import datetime, timedelta

from util import list_submissions, post_submit_grouping_to_taxii_server, unschedule_submission, get_submission

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class TestTaxiiServerConnection:
    def test_taxii_server_discovery(self, taxii2_server, taxii2_server_session, taxii2_server_is_reachable):
        resp = taxii2_server_session.get(taxii2_server.server_discovery_url)
        resp.raise_for_status()
        print(resp.json())

    def test_list_collections_for_default_api_root(self, taxii2_server, taxii2_server_session,
                                                   taxii2_server_is_reachable):
        resp = taxii2_server_session.get(f"{taxii2_server.default_api_root_url}/collections")
        resp.raise_for_status()
        print(resp.json())


def datetime_in_future(in_future: timedelta) -> datetime:
    now = datetime.utcnow()
    return now + in_future


def timestamp_in_future(in_future: timedelta) -> str:
    dt = datetime_in_future(in_future=in_future)
    # No timezone info is expected, UTC is assumed.
    timestamp = dt.isoformat(timespec="seconds")
    return timestamp


class TestStixBundleSubmissionToTaxiiServer:
    def test_immediate_submission(self, session, cleanup_all_collections, taxii_server_setup_and_grouping):
        grouping_id = taxii_server_setup_and_grouping.grouping_id
        ctis_app_taxii_config = taxii_server_setup_and_grouping.taxii_config_name
        taxii2_server_details = taxii_server_setup_and_grouping.taxii2_server

        logger.info("Submitting bundle/grouping to TAXII server...")
        submission_resp = post_submit_grouping_to_taxii_server(session=session,
                                                               grouping_id=grouping_id,
                                                               taxii_config_name=ctis_app_taxii_config,
                                                               taxii_collection_id=taxii2_server_details.readable_and_writable_collection_id)
        logger.info(f"Submission response: {submission_resp}")
        submission_resp_obj = submission_resp["submission"]
        assert submission_resp_obj["status"] == "SENT"
        assert submission_resp_obj["grouping_id"] == grouping_id
        assert submission_resp_obj["taxii_config_name"] == ctis_app_taxii_config

        taxii_server_resp_json = submission_resp_obj["response_json"]
        taxii_server_resp_obj = json.loads(taxii_server_resp_json)
        assert taxii_server_resp_obj["status"] == "complete"

    def test_scheduled_submission(self, session, cleanup_all_collections, taxii_server_setup_and_grouping):
        grouping_id = taxii_server_setup_and_grouping.grouping_id
        ctis_app_taxii_config = taxii_server_setup_and_grouping.taxii_config_name
        taxii2_server_details = taxii_server_setup_and_grouping.taxii2_server

        # Note that the endpoint accepts ISO 8601 formatted timestamp WITHOUT timezone info. UTC is assumed.
        timestamp = timestamp_in_future(in_future=timedelta(seconds=30))
        submission_resp = post_submit_grouping_to_taxii_server(session=session,
                                                               grouping_id=grouping_id,
                                                               taxii_config_name=ctis_app_taxii_config,
                                                               taxii_collection_id=taxii2_server_details.readable_and_writable_collection_id,
                                                               scheduled_at=timestamp)
        submission_resp_obj = submission_resp["submission"]
        assert submission_resp_obj["status"] == "SCHEDULED"
        assert submission_resp_obj["grouping_id"] == grouping_id
        assert submission_resp_obj["taxii_config_name"] == ctis_app_taxii_config
        assert submission_resp_obj["scheduled_at"] == timestamp

        submission_id = submission_resp_obj["submission_id"]

        # Submission scheduler runs every minute, Splunk may throttle this a little, so give some leeway...
        for _ in range(90):
            list_submissions_resp = list_submissions(session=session, query={"submission_id": submission_id}, skip=0,
                                                     limit=0)
            submissions = list_submissions_resp["records"]
            assert len(submissions) == 1
            assert list_submissions_resp["total"] == 1
            submission = submissions[0]
            if submission["status"] == "SENT":
                logger.info(f"Submission was sent successfully: {submission}")
                break
            logger.info(
                f"Still waiting for scheduled submission {submission_id} to be sent... status={submission['status']}")
            time.sleep(1)
        else:
            raise AssertionError(f"Scheduled submission {submission_id} was not sent within expected time.")

    def test_unschedule_scheduled_submission(self, session, cleanup_all_collections, taxii_server_setup_and_grouping):
        grouping_id = taxii_server_setup_and_grouping.grouping_id
        ctis_app_taxii_config = taxii_server_setup_and_grouping.taxii_config_name
        taxii2_server_details = taxii_server_setup_and_grouping.taxii2_server

        timestamp = timestamp_in_future(in_future=timedelta(minutes=10))
        submission_resp = post_submit_grouping_to_taxii_server(session=session,
                                                               grouping_id=grouping_id,
                                                               taxii_config_name=ctis_app_taxii_config,
                                                               taxii_collection_id=taxii2_server_details.readable_and_writable_collection_id,
                                                               scheduled_at=timestamp)
        submission_resp_obj = submission_resp["submission"]
        assert submission_resp_obj["status"] == "SCHEDULED"
        submission_id = submission_resp_obj["submission_id"]
        unschedule_submission(session=session, submission_id=submission_id)

        submission_updated = get_submission(session=session, submission_id=submission_id)
        assert submission_updated["status"] == "CANCELLED"

    def test_list_submissions(self, session, cleanup_all_collections, taxii_server_setup_and_grouping):
        grouping_id = taxii_server_setup_and_grouping.grouping_id
        ctis_app_taxii_config = taxii_server_setup_and_grouping.taxii_config_name
        taxii2_server_details = taxii_server_setup_and_grouping.taxii2_server

        timestamp = timestamp_in_future(in_future=timedelta(minutes=10))
        for _ in range(10):
            post_submit_grouping_to_taxii_server(session=session,
                                                 grouping_id=grouping_id,
                                                 taxii_config_name=ctis_app_taxii_config,
                                                 taxii_collection_id=taxii2_server_details.readable_and_writable_collection_id,
                                                 scheduled_at=timestamp)
        list_submissions_resp = list_submissions(session=session, query={})
        submission_records = list_submissions_resp["records"]
        assert len(submission_records) == 10
        assert list_submissions_resp["total"] == 10
