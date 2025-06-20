import os
import sys
from collections import defaultdict

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from query import query_value_in_list
    from solnlib._utils import get_collection_data
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


def indicators_to_mapping_of_grouping_id_to_indicators(indicators: list) -> dict:
    mapping = defaultdict(list)
    for indicator in indicators:
        grouping_id = indicator["grouping_id"]
        mapping[grouping_id].append(indicator["indicator_id"])
    return mapping

class ListGroupingsHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        # Gather all indicators and group by grouping_id
        resp = self.handle_query_collection(input_json=input_json, query_params=query_params, session_key=session_key, collection_name="groupings")
        grouping_ids = list(set([x["grouping_id"] for x in resp["records"]]))
        self.logger.info(f"grouping_ids: {grouping_ids}")
        indicators_collection = self.get_collection(collection_name="indicators", session_key=session_key)

        indicators = []
        if grouping_ids:
            indicators_query = query_value_in_list("grouping_id", grouping_ids)
            self.logger.info(f"indicators_query: {indicators_query}")
            indicators = indicators_collection.query(fields="grouping_id,indicator_id", query=indicators_query, limit=0, offset=0)

        self.logger.info(f"indicators: {indicators}")

        mapping = indicators_to_mapping_of_grouping_id_to_indicators(indicators)

        new_records = []
        for record in resp["records"]:
            new_record = record.copy()
            new_record["indicators"] = mapping.get(record["grouping_id"], [])
            new_records.append(new_record)

        resp["records"] = new_records
        return resp


Handler = ListGroupingsHandler(logger=logger).generate_splunk_server_class()
