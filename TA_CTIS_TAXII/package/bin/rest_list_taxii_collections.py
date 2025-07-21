import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from solnlib._utils import get_collection_data
    from taxii2client.v21 import ApiRoot
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class ListTaxiiCollectionsHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if "config_name" not in query_params:
            raise ValueError("config_name is a required query parameter")
        config_name = query_params.get("config_name")[0]
        self.logger.info(f"config_name: {config_name}")
        config = self.get_taxii_config(session_key=session_key, stanza_name=config_name)
        api_root = self.get_api_root(url=config["api_root_url"], user=config["username"], password=config["password"])
        collections = api_root.collections
        return {"collections": [x._raw for x in collections]}


Handler = ListTaxiiCollectionsHandler(logger=logger).generate_splunk_server_class()
