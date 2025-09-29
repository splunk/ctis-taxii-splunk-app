import os
import sys
import traceback

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from rest_list_identities import ListIdentitiesHandler
    from common import get_logger_for_script
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

from splunk.persistconn.application import PersistentServerConnectionApplication

# https://dev.splunk.com/enterprise/docs/devtools/customrestendpoints/customrestscript
class Handler(PersistentServerConnectionApplication):
    def __init__(self, _command_line, _command_arg):
        PersistentServerConnectionApplication.__init__(self)

        # Set via restmap.conf stanza property 'script.param'
        self.handler_name = _command_arg
        try:
            handler_class = globals().get(self.handler_name)
            self.handler_instance = handler_class(logger=get_logger_for_script(__file__))
        except AttributeError:
            raise ValueError(f"Handler class {self.handler_name} not found")

    def handle(self, in_string):
        return self.handler_instance.generate_response(in_string)