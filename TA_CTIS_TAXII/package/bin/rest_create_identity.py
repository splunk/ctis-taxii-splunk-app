import logging

from common import AbstractRestHandler
from models import IdentityModelV1, identity_converter

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class CreateIdentityHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        # TODO: Utility to nicely convert the ClassValidationError to a human-readable error message
        try:
            identity = identity_converter.structure(input_json, IdentityModelV1)
        except Exception as exc:
            logger.exception(f"Failed to convert input JSON to Identity Model")
            raise ValueError(repr(exc))

        self.kvstore_collections_context.identities.insert_record(identity)

        response = {
            "status" : "success",
            "identity": identity_converter.unstructure(identity),
        }
        return response
