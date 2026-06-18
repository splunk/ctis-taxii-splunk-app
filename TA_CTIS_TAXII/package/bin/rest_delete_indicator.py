from common import AbstractRestHandler


class DeleteIndicatorHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        payload_indicator_id = input_json["indicator_id"]
        assert isinstance(payload_indicator_id, str) or isinstance(payload_indicator_id, list), "Expected indicator_id to be either a string or an array of strings"

        if isinstance(payload_indicator_id, str):
            indicator_ids = [payload_indicator_id]
        else:
            indicator_ids = payload_indicator_id

        for indicator_id in indicator_ids:
            indicator = self.kvstore_collections_context.indicators.get_indicator(indicator_id=indicator_id)
            self.kvstore_collections_context.indicators.delete_indicator(indicator_id=indicator_id)
            self.update_grouping_tlp_rating_to_match_indicators(grouping_id=indicator.grouping_id)

        return {}
