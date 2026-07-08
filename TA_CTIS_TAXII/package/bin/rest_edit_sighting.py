import logging

from common import AbstractRestHandler

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class EditSightingHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        assert input_json.get('sighting_id') is not None, "sighting_id is required"
        sighting_id = input_json["sighting_id"]

        # Validate references to indicator IDs and identity IDs. These must exist in the local KVStore.
        updated_structured = self.kvstore_collections_context.sightings.preview_updated_sighting(sighting_id=sighting_id, updates=input_json)
        self.kvstore_collections_context.validate_sighting_references(sighting=updated_structured)

        updated = self.kvstore_collections_context.sightings.update_sighting_raw(sighting_id=sighting_id, updates=input_json)
        return updated
