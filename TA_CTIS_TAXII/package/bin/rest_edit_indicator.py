import logging

from common import AbstractRestHandler

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class EditIndicatorHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        logger.info(f"input_json={input_json}")
        indicator_id = input_json["indicator_id"]
        indicators_collection = self.kvstore_collections_context.indicators
        updated_indicator_raw = indicators_collection.update_indicator_raw(indicator_id=indicator_id, updates=input_json)
        self.update_grouping_tlp_rating_to_match_indicators(grouping_id=updated_indicator_raw["grouping_id"])

        response = {
            "indicator": updated_indicator_raw,
        }
        return response
