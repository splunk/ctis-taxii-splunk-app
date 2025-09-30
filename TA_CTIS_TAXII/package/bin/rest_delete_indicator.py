from common import AbstractRestHandler


class DeleteIndicatorHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        indicator_id = input_json["indicator_id"]
        indicator = self.kvstore_collections_context.indicators.get_indicator(indicator_id=indicator_id)

        self.kvstore_collections_context.indicators.delete_indicator(indicator_id=indicator_id)

        self.update_grouping_tlp_rating_to_match_indicators(grouping_id=indicator.grouping_id)

        return {}
