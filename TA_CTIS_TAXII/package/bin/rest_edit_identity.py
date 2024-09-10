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
    import remote_pdb
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
        - Validate input_json.identity_id exists in collection
        - Read record from collection
        - Validate input_json contains only expected fields
        - Merge input_json with record
        """
        identity_id = input_json["identity_id"]
        results = collection.query(query={"identity_id": identity_id})
        self.logger.info(f"input_json={input_json}")
        self.logger.info(f"Results: {results}")
        assert len(results) > 0, f"Identity ID {identity_id} not found"
        assert len(results) == 1, f"Identity ID {identity_id} is not unique"

        saved_identity = results[0]
        # TODO: whitelist fields to be modified
        # TODO: update modified timestamp to current time (can just delete the modified value)
        merged = {**saved_identity, **input_json}
        self.logger.info(f"Merged: {merged}")

        structured = identity_converter.structure(merged, IdentityModelV1)
        updated_identity_as_dict = identity_converter.unstructure(structured)
        self.logger.info(f"Updating identity: {updated_identity_as_dict}")

        collection.update(id=structured.key, data=updated_identity_as_dict)

        response = {
            "identity": updated_identity_as_dict,
        }
        return response


EditIdentityHandler = Handler(logger=logger).generate_splunk_server_class()
