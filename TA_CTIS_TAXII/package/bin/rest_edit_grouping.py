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
        collection = get_collection_data(collection_name="groupings", session_key=session_key, app=NAMESPACE)

        assert "grouping_id" in input_json, "grouping_id is required"
        grouping_id = input_json["grouping_id"]
        updated_record = self.update_record(collection=collection, query_for_one_record={"grouping_id": grouping_id},
                                            input_json=input_json, converter=grouping_converter,
                                            model_class=GroupingModelV1)

        response = {
            "grouping": updated_record,
        }
        return response


Handler = EditGroupingHandler(logger=logger).generate_splunk_server_class()
