import logging

from common import AbstractRestHandler

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class DeleteSightingHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        assert input_json.get('sighting_id') is not None, "sighting_id is required"
        sighting_id = input_json["sighting_id"]
        key_deleted = self.kvstore_collections_context.sightings.delete_sighting(sighting_id=sighting_id)

        return {
            "sighting_id": sighting_id,
            "key_deleted": key_deleted
        }
