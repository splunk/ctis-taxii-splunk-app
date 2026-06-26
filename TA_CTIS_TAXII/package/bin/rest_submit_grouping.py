import logging
from datetime import datetime
from typing import Optional, Tuple

from common import AbstractRestHandler
from models import SubmissionModelV1, SubmissionStatus

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def validate_input_json(input_json: dict):
    if "grouping_id" not in input_json:
        raise ValueError("grouping_id is required.")
    if "taxii_config_name" not in input_json:
        raise ValueError("taxii_config_name is required.")
    if "taxii_collection_id" not in input_json:
        raise ValueError("taxii_collection_id is required.")


class SubmitGroupingHandler(AbstractRestHandler):
    def insert_submission_record(self, grouping_id: str, taxii_config_name: str, taxii_collection_id: str, scheduled_at: Optional[str] = None, include_sightings: bool = False) -> Tuple[SubmissionModelV1, dict]:
        scheduled_at_kwargs = {}
        if scheduled_at:
            scheduled_at_kwargs["scheduled_at"] = datetime.fromisoformat(scheduled_at)

        new_submission = SubmissionModelV1(
            grouping_id=grouping_id,
            bundle_json_sent=None,
            taxii_config_name=taxii_config_name,
            collection_id=taxii_collection_id,
            status=SubmissionStatus.SCHEDULED,
            include_sightings=include_sightings,
            **scheduled_at_kwargs
        )
        unstructured = self.kvstore_collections_context.submissions.insert_record(record=new_submission)
        return new_submission, unstructured

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        validate_input_json(input_json=input_json)
        grouping_id = input_json["grouping_id"]
        taxii_config_name = input_json["taxii_config_name"]
        taxii_collection_id = input_json["taxii_collection_id"]
        include_sightings = input_json.get("include_sightings", False)
        assert isinstance(include_sightings, bool), "include_sightings must be a boolean value."

        # Validate that TAXII Config exists
        self.get_taxii_config(session_key=session_key, stanza_name=taxii_config_name)

        # Validates that the grouping exists, along with the indicators and identity objects
        bundle = self.generate_stix_bundle_for_grouping(grouping_id=grouping_id, include_sightings=include_sightings)
        logger.info(f"Validated bundle: {bundle.serialize()}")

        scheduled_at = input_json.get("scheduled_at")  # optional
        structured, unstructured = self.insert_submission_record(grouping_id=grouping_id,
                                                                 taxii_config_name=taxii_config_name,
                                                                 taxii_collection_id=taxii_collection_id,
                                                                 scheduled_at=scheduled_at,
                                                                 include_sightings=include_sightings)
        if scheduled_at:
            return {
                "submission": unstructured
            }

        # Submit immediately to TAXII server
        return {
            "submission": self.submit_grouping(session_key=session_key, submission_id=structured.submission_id)
        }
