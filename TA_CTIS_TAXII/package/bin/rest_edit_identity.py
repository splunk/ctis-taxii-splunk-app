import logging

from solnlib._utils import get_collection_data

from common import AbstractRestHandler, NAMESPACE

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class EditIdentityHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        collection = get_collection_data(collection_name="identities", session_key=session_key, app=NAMESPACE)
        logger.info(f"Collection: {collection}")
        logger.info(f"input_json={input_json}")
        identity_id = input_json["identity_id"]
        identities_collection = self.kvstore_collections_context.identities
        updated_record_raw = identities_collection.update_identity_raw(identity_id=identity_id, updates=input_json)

        response = {
            "identity": updated_record_raw,
        }
        return response
