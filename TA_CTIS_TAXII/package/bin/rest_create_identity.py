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

        """
        TODO:
        - Validation: Check if identity ID exists already. However, current use-case is to generate a new identity UUID
        """

        # TODO: Utility to nicely convert the ClassValidationError to a human-readable error message
        try:
            identity = identity_converter.structure(input_json, IdentityModelV1)
        except Exception as exc:
            self.logger.exception(f"Failed to convert input JSON to Identity Model")
            raise ValueError(repr(exc))

        identity_dict = identity_converter.unstructure(identity)
        self.logger.info(f"Inserting identity: {identity_dict}")
        collection.insert(identity_dict)

        response = {
            "status" : "success",
            "identity": identity_dict,
        }
        return response


CreateIdentityHandler = Handler(logger=logger).generate_splunk_server_class()
