from common import AbstractRestHandler
from models import GroupingModelV1, grouping_converter


class CreateGroupingHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        grouping = grouping_converter.structure(input_json, GroupingModelV1)
        self.kvstore_collections_context.validate_grouping_references(grouping=grouping)
        as_dict = self.kvstore_collections_context.groupings.insert_record(record=grouping)

        return {
            "grouping": as_dict,
        }
