from common import AbstractRestHandler, get_logger_for_script

logger = get_logger_for_script(__file__)


class DeleteGroupingHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        assert "grouping_id" in input_json, "grouping_id is required."
        grouping_id = input_json["grouping_id"]
        self.kvstore_collections_context.groupings.delete_grouping(grouping_id=grouping_id)

        return {}
