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


class CreateGroupingHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        groupings_collection = get_collection_data(collection_name="groupings", session_key=session_key, app=NAMESPACE)

        created_by_ref = input_json["created_by_ref"]
        identity_exists = self.kvstore_collections_context.identities.check_if_identity_exists(identity_id=created_by_ref)
        if not identity_exists:
            raise ValueError(f"Identity not found in identities collection: {created_by_ref}")

        as_dict = self.insert_record(collection=groupings_collection, input_json=input_json, converter=grouping_converter, model_class=GroupingModelV1)

        response = {
            "grouping": as_dict,
        }
        return response


Handler = CreateGroupingHandler(logger=logger).generate_splunk_server_class()
