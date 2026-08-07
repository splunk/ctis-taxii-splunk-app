#!/usr/bin/env python
import json
import logging
import os
import sys
import time

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")
from splunklib.searchcommands import dispatch, GeneratingCommand, Configuration

try:
    from common import AbstractRestHandler, NAMESPACE, setup_root_logger
    from models import KVStoreCollectionsContext, SubmissionStatus
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

# For the REST endpoints this is set by common_rest_handler_entrypoint.py. Need to do same here since this is not a REST endpoint.
setup_root_logger(root_logger_log_file="job_scheduler")
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class MyHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        return {}


@Configuration()
class JobSchedulerCommand(GeneratingCommand):

    def job_submission_scheduler(self):
        submissions = self.handler.kvstore_collections_context.submissions.list_scheduled_due_to_be_submitted()

        logger.info(f"Number of submissions ready to be submitted: {len(submissions)}.")

        for submission in submissions:
            logger.info(f"Submission ready to be submitted: {submission}")
            try:
                updated_submission = self.handler.submit_grouping(session_key=self.service.token,
                                                             submission_id=submission.submission_id)
                yield {'_time': time.time(), '_raw': json.dumps(updated_submission)}
            except Exception as exc:
                logger.exception(f"Error submitting grouping: {exc}")


    def generate(self):
        # To connect with Splunk, use the instantiated service object which is created using the server-uri and
        # other meta details and can be accessed as shown below
        # Example:-
        #    service = self.service
        service = self.service
        session_key = service.token

        self.handler = MyHandler()

        # Need to manually set the kvstore_collections_context since we are not using the REST handler's infrastructure
        self.handler.kvstore_collections_context = KVStoreCollectionsContext(session_key=session_key, app_namespace=NAMESPACE)

        for job_func in [self.job_submission_scheduler]:
            try:
                yield from job_func()
            except Exception:
                logger.exception("Error executing job")



dispatch(JobSchedulerCommand, sys.argv, sys.stdin, sys.stdout, __name__)
