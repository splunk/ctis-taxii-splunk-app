from common import AbstractRestHandler
from models import SightingModelV1, sighting_converter


class CreateSightingHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        structured = sighting_converter.structure(input_json, SightingModelV1)
        self.kvstore_collections_context.validate_sighting_references(sighting=structured)
        unstructured = self.kvstore_collections_context.sightings.insert_record(record=structured)

        return unstructured
