from common import AbstractRestHandler, get_logger_for_script
from models import SubmissionStatus

logger = get_logger_for_script(__file__)


class UnscheduleSubmissionHandler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        submission_id = input_json.get("submission_id")
        if not submission_id:
            raise ValueError("submission_id is required")

        submission = self.kvstore_collections_context.submissions.get_submission(submission_id=submission_id)

        if submission.status != SubmissionStatus.SCHEDULED:
            raise ValueError(f"Submission {submission_id} is not scheduled")

        updated_submission = self.kvstore_collections_context.submissions.update_submission(submission_id=submission_id, updates={
            "status": SubmissionStatus.CANCELLED,
        })
        updated_submission_raw = self.kvstore_collections_context.submissions.model_converter.unstructure(updated_submission)

        response = {
            "submission": updated_submission_raw,
        }
        return response
