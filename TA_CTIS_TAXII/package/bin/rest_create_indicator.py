import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from server_exception import ServerException
    from models import IndicatorModelV1, indicator_converter, form_payload_to_indicators, GroupingModelV1, \
        grouping_converter
    from solnlib._utils import get_collection_data
    import remote_pdb
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class Handler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        collection = get_collection_data(collection_name="indicators", session_key=session_key, app=NAMESPACE)

        # Verify that the grouping_id exists
        grouping_id = input_json["grouping_id"]
        groupings = get_collection_data(collection_name="groupings", session_key=session_key, app=NAMESPACE)
        self.query_exactly_one_record(collection=groupings, query={"grouping_id": grouping_id})

        # TODO: Utility to nicely convert the ClassValidationError to a human-readable error message
        try:
            errors, models = form_payload_to_indicators(input_json)
        except Exception as exc:
            self.logger.exception(f"Failed to deserialize input JSON to IndicatorModelV1 instances")
            raise ValueError(repr(exc))

        if errors:
            raise ServerException(message="Validation failed deserializing indicators payload", errors=errors)

        if len(models) == 0:
            raise ValueError("No indicators were deserialized from the input JSON")

        serialized = []
        for model in models:
            indicator_dict = indicator_converter.unstructure(model)
            self.logger.info(f"Inserting indicator: {indicator_dict}")
            collection.insert(indicator_dict)
            serialized.append(indicator_dict)

        self.update_grouping_modified_time_to_now(grouping_id=grouping_id, session_key=session_key)

        response = {
            "status": "success",
            "indicators": serialized,
        }
        return response


CreateIndicatorHandler = Handler(logger=logger).generate_splunk_server_class()
