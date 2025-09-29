import logging

from solnlib._utils import get_collection_data

from common import AbstractRestHandler, NAMESPACE
from models import form_payload_to_indicators, indicator_converter
from server_exception import ServerException

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class CreateIndicatorHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        collection = get_collection_data(collection_name="indicators", session_key=session_key, app=NAMESPACE)

        # Verify that the grouping_id exists
        grouping_id = input_json["grouping_id"]

        if not self.kvstore_collections_context.groupings.check_if_grouping_exists(grouping_id=grouping_id):
            raise ValueError(f"Grouping not found in groupings collection: {grouping_id}")

        # TODO: Utility to nicely convert the ClassValidationError to a human-readable error message
        try:
            errors, models = form_payload_to_indicators(input_json)
        except Exception as exc:
            logger.exception(f"Failed to deserialize input JSON to IndicatorModelV1 instances")
            raise ValueError(repr(exc))

        if errors:
            raise ServerException(message="Validation failed deserializing indicators payload", errors=errors)

        if len(models) == 0:
            raise ValueError("No indicators were deserialized from the input JSON")

        serialized = []
        for model in models:
            indicator_dict = indicator_converter.unstructure(model)
            logger.info(f"Inserting indicator: {indicator_dict}")
            collection.insert(indicator_dict)
            serialized.append(indicator_dict)

        # Also has side effect of updating the grouping's modified time to now
        self.update_grouping_tlp_rating_to_match_indicators(grouping_id=grouping_id)

        response = {
            "status": "success",
            "indicators": serialized,
        }
        return response
