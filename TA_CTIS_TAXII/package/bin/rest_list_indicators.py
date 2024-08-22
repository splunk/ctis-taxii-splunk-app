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
        self.logger.info(f"input_json: {input_json}")
        self.logger.info(f"query_params: {query_params}")

        collection_query_kwargs = self.extract_collection_query_kwargs(query_params)

        collection = self.get_collection(collection_name="indicators", session_key=session_key)
        self.logger.info(f"Collection: {collection}")
        self.logger.info(f"Collection query kwargs: {collection_query_kwargs}")
        records = collection.query(**collection_query_kwargs)
        self.logger.info(f"Records found: {len(records)}")

        total_records = self.get_collection_size(collection, query=collection_query_kwargs.get("query"))
        response = {
            "records": records,
            "total": total_records,
        }
        return response


ListIndicatorsHandler = Handler(logger=logger).generate_splunk_server_class()
