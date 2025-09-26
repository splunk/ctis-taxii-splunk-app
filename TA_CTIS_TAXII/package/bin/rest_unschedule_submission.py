import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from models import SubmissionStatus, submission_converter, SubmissionModelV1
    from solnlib._utils import get_collection_data
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

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


Handler = UnscheduleSubmissionHandler(logger=logger).generate_splunk_server_class()
