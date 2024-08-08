import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from solnlib._utils import get_collection_data
    import remote_pdb
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class Handler(AbstractRestHandler):
    def handle(self, input_json: dict, session_key: str) -> dict:
        field_name = input_json.get("splunk_field_name")
        assert field_name, "splunk_field_name is required"

        field_value = input_json.get("splunk_field_value")
        assert field_value, "splunk_field_value is required"

        collection = get_collection_data(collection_name="indicators", session_key=session_key, app=NAMESPACE)
        self.logger.info(f"Collection: {collection}")
        # remote_pdb.RemotePdb(host="0.0.0.0", port=4444).set_trace()

        """
        TODO:
        - Validation on payload JSON
            - required fields
            - validate STIX pattern
            - Check if indicator ID exists already
        """

        # Optionally set a "_key" as partition key
        collection.insert(input_json)

        response = {
            "status": "success",
        }
        return response


CreateIndicatorHandler = Handler(logger=logger).generate_splunk_server_class()
