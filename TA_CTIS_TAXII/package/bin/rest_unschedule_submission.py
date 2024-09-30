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
    import remote_pdb
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class UnscheduleSubmissionHandler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        submission_id = input_json.get("submission_id")
        if not submission_id:
            raise ValueError("submission_id is required")

        query_for_one_record = {"submission_id": submission_id}
        collection = get_collection_data(collection_name="submissions", session_key=session_key, app=NAMESPACE)
        submission = self.query_exactly_one_record(collection=collection, query=query_for_one_record)
        submission_model = submission_converter.structure(submission, SubmissionModelV1)

        if submission_model.status != SubmissionStatus.SCHEDULED:
            raise ValueError(f"Submission {submission_id} is not scheduled")

        updated_record = self.update_record(collection=collection,
                                            query_for_one_record=query_for_one_record,
                                            input_json={
                                                "status": SubmissionStatus.CANCELLED.value,
                                            },
                                            converter=submission_converter,
                                            model_class=SubmissionModelV1)

        response = {
            "submission": updated_record,
        }
        return response


Handler = UnscheduleSubmissionHandler(logger=logger).generate_splunk_server_class()
