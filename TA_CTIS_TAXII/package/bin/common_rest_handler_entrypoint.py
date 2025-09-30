import os
import sys
import traceback
import contextvars
import logging
from datetime import datetime

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from splunk.persistconn.application import PersistentServerConnectionApplication
    from solnlib.log import Logs
    from common import NAMESPACE, setup_root_logger

    from rest_list_identities import ListIdentitiesHandler
    from rest_suggest_stix_pattern import SuggestStixPatternHandler
    from rest_create_indicator import CreateIndicatorHandler
    from rest_list_indicators import ListIndicatorsHandler
    from rest_suggest_stix_pattern import SuggestStixPatternHandler
    from rest_create_indicator import CreateIndicatorHandler
    from rest_list_indicators import ListIndicatorsHandler
    from rest_edit_indicator import EditIndicatorHandler
    from rest_delete_indicator import DeleteIndicatorHandler
    from rest_create_identity import CreateIdentityHandler
    from rest_edit_identity import EditIdentityHandler
    from rest_delete_identity import DeleteIdentityHandler
    from rest_list_identities import ListIdentitiesHandler
    from rest_list_indicator_categories import ListIndicatorCategoriesHandler
    from rest_create_grouping import CreateGroupingHandler
    from rest_list_groupings import ListGroupingsHandler
    from rest_edit_grouping import EditGroupingHandler
    from rest_delete_grouping import DeleteGroupingHandler
    from rest_get_stix_bundle_for_grouping import GetStixBundleForGroupingHandler
    from rest_list_submissions import ListSubmissionsHandler
    from rest_unschedule_submission import UnscheduleSubmissionHandler
    from rest_submit_grouping import SubmitGroupingHandler
    from rest_list_taxii_collections import ListTaxiiCollectionsHandler
except ImportError as e:
    tb = traceback.format_exc()
    sys.stderr.write(f"Failed to import one or more REST handlers: {e} {tb}\n")
    raise e

ctx_request_time_utc = contextvars.ContextVar("request_time_utc", default=None)
ctx_rest_handler = contextvars.ContextVar("rest_handler", default=None)

class RequestMetadataFilter(logging.Filter):
    def filter(self, record):
        record.request_time_utc = ctx_request_time_utc.get()
        record.rest_handler = ctx_rest_handler.get()
        return True

LOG_FORMAT = "%(asctime)s log_level=%(levelname)s pid=%(process)d tid=%(threadName)s file=%(filename)s:%(funcName)s:%(lineno)d request_time_utc=%(request_time_utc)s rest_handler=%(rest_handler)s | %(message)s"
def setup_logging():
    root_logger = logging.getLogger()

    # This already has checks to avoid multiple handlers for same log file
    setup_root_logger(root_logger_log_file="rest_handlers", log_format=LOG_FORMAT)

    if len(root_logger.handlers) > 1:
        root_logger.warning(f"More than one handler found on root logger. handlers={root_logger.handlers}")

    for handler in root_logger.handlers:
        handler.addFilter(RequestMetadataFilter())


# https://dev.splunk.com/enterprise/docs/devtools/customrestendpoints/customrestscript
class Handler(PersistentServerConnectionApplication):
    def __init__(self, _command_line, _command_arg):
        setup_logging()
        PersistentServerConnectionApplication.__init__(self)

        # Set via restmap.conf stanza property 'script.param'
        self.handler_name = _command_arg
        try:
            handler_class = globals().get(self.handler_name)

            self.handler_instance = handler_class()
        except AttributeError:
            raise ValueError(f"Handler class {self.handler_name} not found")

    def handle(self, in_string):
        ctx_request_time_utc.set(datetime.utcnow().isoformat(timespec="microseconds"))
        ctx_rest_handler.set(self.handler_name)
        return self.handler_instance.generate_response(in_string)