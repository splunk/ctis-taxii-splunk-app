from common import AbstractRestHandler, get_logger_for_script

logger = get_logger_for_script(__file__)


class EditGroupingHandler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        assert "grouping_id" in input_json, "grouping_id is required"
        grouping_id = input_json["grouping_id"]

        # TODO: Validate that tlp_v2_rating is at least as most as constituent indicators' tlp_v2_rating

        groupings_collection = self.kvstore_collections_context.groupings
        updated_record_raw = groupings_collection.update_grouping_raw(grouping_id=grouping_id, updates=input_json)

        response = {
            "grouping": updated_record_raw,
        }
        return response
