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


class Handler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        self.logger.info(f"input_json={input_json}")

        indicator_id = input_json["indicator_id"]
        indicators_collection = self.kvstore_collections_context.indicators
        updated_indicator_raw = indicators_collection.update_indicator_raw(indicator_id=indicator_id, updates=input_json)

        self.update_grouping_tlp_rating_to_match_indicators(grouping_id=updated_indicator_raw["grouping_id"])

        response = {
            "indicator": updated_indicator_raw,
        }
        return response


EditIndicatorHandler = Handler(logger=logger).generate_splunk_server_class()
