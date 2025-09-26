#!/usr/bin/env python
import json
import os
import sys
import time
from datetime import datetime

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")
from splunklib.searchcommands import dispatch, GeneratingCommand, Configuration

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from models import KVStoreCollectionsContext, SubmissionStatus
    from solnlib._utils import get_collection_data
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class MyHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        return {}


@Configuration()
class SubmissionSchedulerCommand(GeneratingCommand):

    def generate(self):
        # To connect with Splunk, use the instantiated service object which is created using the server-uri and
        # other meta details and can be accessed as shown below
        # Example:-
        #    service = self.service
        service = self.service
        session_key = service.token  # not sure if this is the right way to get the session key
        handler = MyHandler(logger=logger)

        # Need to manually set the kvstore_collections_context since we are not using the REST handler's infrastructure
        handler.kvstore_collections_context = KVStoreCollectionsContext(logger=logger, session_key=session_key, app_namespace=NAMESPACE)

        now_as_isostring = datetime.utcnow().isoformat()
        query = {
            "status": SubmissionStatus.SCHEDULED.value,
            "scheduled_at": {"$lte": now_as_isostring}
        }
        logger.info(f"Querying for submissions: {query}")
        submissions = handler.kvstore_collections_context.submissions.fetch_many_structured(query=query)

        logger.info(f"Number of submissions ready to be submitted: {len(submissions)}.")

        for submission in submissions:
            logger.info(f"Submission ready to be submitted: {submission}")
            try:
                updated_submission = handler.submit_grouping(session_key=session_key,
                                                             submission_id=submission.submission_id)
                yield {'_time': time.time(), '_raw': json.dumps(updated_submission)}
            except Exception as exc:
                logger.exception(f"Error submitting grouping: {exc}")


dispatch(SubmissionSchedulerCommand, sys.argv, sys.stdin, sys.stdout, __name__)
