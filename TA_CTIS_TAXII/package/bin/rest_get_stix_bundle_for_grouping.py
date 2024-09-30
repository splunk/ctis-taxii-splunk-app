import json
import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler
    from solnlib._utils import get_collection_data
    import remote_pdb
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class GetStixBundleForGroupingHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if "grouping_id" not in query_params:
            raise ValueError("grouping_id is required as query parameter.")
        grouping_id = query_params["grouping_id"][0]
        bundle = self.generate_stix_bundle_for_grouping(grouping_id=grouping_id, session_key=session_key)

        return {
            "bundle": json.loads(bundle.serialize())
        }


Handler = GetStixBundleForGroupingHandler(logger=logger).generate_splunk_server_class()
