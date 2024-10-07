import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from models import IndicatorModelV1, indicator_converter
    from solnlib._utils import get_collection_data
    import remote_pdb
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class Handler(AbstractRestHandler):

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        collection = get_collection_data(collection_name="indicators", session_key=session_key, app=NAMESPACE)
        self.logger.info(f"Collection: {collection}")
        self.logger.info(f"input_json={input_json}")

        indicator_id = input_json["indicator_id"]
        updated_record = self.update_record(collection, query_for_one_record={"indicator_id": indicator_id},
                                            input_json=input_json, converter=indicator_converter,
                                            model_class=IndicatorModelV1)
        grouping_id = updated_record["grouping_id"]
        self.update_grouping_modified_time_to_now(grouping_id=grouping_id, session_key=session_key)

        response = {
            "indicator": updated_record,
        }
        return response


EditIndicatorHandler = Handler(logger=logger).generate_splunk_server_class()
