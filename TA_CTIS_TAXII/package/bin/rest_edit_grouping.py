import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from models import GroupingModelV1, grouping_converter
    from solnlib._utils import get_collection_data
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class EditGroupingHandler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        assert "grouping_id" in input_json, "grouping_id is required"
        grouping_id = input_json["grouping_id"]

        # TODO: Validate that tlp_v2_rating is at least as most as constituent indicators' tlp_v2_rating

        groupings_collection = self.kvstore_collections_context.groupings
        updated_record = groupings_collection.update_grouping(grouping_id=grouping_id, updates=input_json)
        updated_record_raw = groupings_collection.model_converter.unstructure(updated_record)

        response = {
            "grouping": updated_record_raw,
        }
        return response


Handler = EditGroupingHandler(logger=logger).generate_splunk_server_class()
