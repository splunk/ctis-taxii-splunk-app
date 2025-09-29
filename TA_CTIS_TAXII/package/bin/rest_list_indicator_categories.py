from cim_to_stix import IoCCategory
from common import AbstractRestHandler


class ListIndicatorCategoriesHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        return {
            "categories": [x.value for x in IoCCategory],
        }
