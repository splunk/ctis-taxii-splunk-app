import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from models import IndicatorModelV1, indicator_converter
    from solnlib._utils import get_collection_data
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class DeleteIndicatorHandler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        indicator_id = input_json["indicator_id"]
        indicator = self.kvstore_collections_context.indicators.get_indicator(indicator_id=indicator_id)

        self.kvstore_collections_context.indicators.delete_indicator(indicator_id=indicator_id)

        # TODO: Replace with a convenience method, since this is repeated across multiple handlers
        # Update the grouping's modified time to now
        self.kvstore_collections_context.groupings.update_grouping(grouping_id=indicator.grouping_id, updates={})

        return {}


Handler = DeleteIndicatorHandler(logger=logger).generate_splunk_server_class()
