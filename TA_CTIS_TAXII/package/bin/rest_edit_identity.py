import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from models import IdentityModelV1, identity_converter
    from solnlib._utils import get_collection_data
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class Handler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        collection = get_collection_data(collection_name="identities", session_key=session_key, app=NAMESPACE)
        self.logger.info(f"Collection: {collection}")
        self.logger.info(f"input_json={input_json}")

        identity_id = input_json["identity_id"]
        identities_collection = self.kvstore_collections_context.identities
        updated_record_raw = identities_collection.update_identity_raw(identity_id=identity_id, updates=input_json)

        response = {
            "identity": updated_record_raw,
        }
        return response


EditIdentityHandler = Handler(logger=logger).generate_splunk_server_class()
