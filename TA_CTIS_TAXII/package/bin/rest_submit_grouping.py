import logging
from datetime import datetime

from common import AbstractRestHandler
from models import SubmissionModelV1, SubmissionStatus, submission_converter

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class SubmitGroupingHandler(AbstractRestHandler):
    def update_grouping_last_submission_at(self, grouping_id: str, last_submission_at: datetime):
        self.kvstore_collections_context.groupings.update_grouping_raw(grouping_id=grouping_id, updates={
            "last_submission_at": last_submission_at.isoformat()
        })

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if "grouping_id" not in input_json:
            raise ValueError("grouping_id is required.")
        grouping_id = input_json["grouping_id"]

        if "taxii_config_name" not in input_json:
            raise ValueError("taxii_config_name is required.")
        taxii_config_name = input_json["taxii_config_name"]

        if "taxii_collection_id" not in input_json:
            raise ValueError("taxii_collection_id is required.")
        taxii_collection_id = input_json["taxii_collection_id"]

        # Validate that TAXII Config exists
        self.get_taxii_config(session_key=session_key, stanza_name=taxii_config_name)

        # Validates that the grouping exists, along with the indicators and identity objects
        bundle = self.generate_stix_bundle_for_grouping(grouping_id=grouping_id)
        logger.info(f"bundle: {bundle.serialize()}")

        submissions_collection = self.get_collection(session_key=session_key, collection_name="submissions")

        scheduled_at = input_json.get("scheduled_at")  # optional
        scheduled_at_kwargs = {}
        if scheduled_at:
            scheduled_at_kwargs["scheduled_at"] = datetime.fromisoformat(scheduled_at)

        new_submission = SubmissionModelV1(
            grouping_id=grouping_id,
            bundle_json_sent=None,
            taxii_config_name=taxii_config_name,
            collection_id=taxii_collection_id,
            status=SubmissionStatus.SCHEDULED,
            **scheduled_at_kwargs
        )
        new_submission_dict = submission_converter.unstructure(new_submission)
        logger.info(f"new_submission_dict: {new_submission_dict}")
        self.insert_record(collection=submissions_collection, input_json=new_submission_dict,
                           converter=submission_converter, model_class=SubmissionModelV1)

        self.update_grouping_last_submission_at(grouping_id=grouping_id, last_submission_at=new_submission.scheduled_at)

        submission_to_return = new_submission_dict
        if not scheduled_at:
            updated_submission = self.submit_grouping(session_key=session_key,
                                                      submission_id=new_submission.submission_id)
            submission_to_return = updated_submission
        return {
            "submission": submission_to_return
        }
