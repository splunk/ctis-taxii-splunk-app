import logging

from solnlib._utils import get_collection_data

from common import AbstractRestHandler, NAMESPACE

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class DeleteIdentityHandler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        collection = get_collection_data(collection_name="identities", session_key=session_key, app=NAMESPACE)
        logger.info(f"Collection: {collection}")
        logger.info(f"input_json={input_json}")

        identity_id = input_json["identity_id"]
        self.kvstore_collections_context.identities.delete_identity(identity_id=identity_id)

        response = {
            "identity_id": identity_id,
        }
        return response
