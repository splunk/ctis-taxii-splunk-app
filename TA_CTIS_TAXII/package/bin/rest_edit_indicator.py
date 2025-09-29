from common import AbstractRestHandler, get_logger_for_script

logger = get_logger_for_script(__file__)

class EditIndicatorHandler(AbstractRestHandler):
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
