from solnlib._utils import get_collection_data

from common import AbstractRestHandler, NAMESPACE, get_logger_for_script

logger = get_logger_for_script(__file__)

class EditIdentityHandler(AbstractRestHandler):
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
