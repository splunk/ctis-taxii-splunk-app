import json

from common import AbstractRestHandler
from models import serialize_stix_object


class GetStixBundleForGroupingHandler(AbstractRestHandler):
    # This REST endpoint is used to preview the STIX Bundle JSON generated for a specific grouping.
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if "grouping_id" not in query_params:
            raise ValueError("grouping_id is required as query parameter.")
        grouping_id = query_params["grouping_id"][0]
        bundle = self.generate_stix_bundle_for_grouping(grouping_id=grouping_id)

        return {
            "bundle": json.loads(serialize_stix_object(stix_object=bundle))
        }
