from common import get_logger_for_script, AbstractRestHandler
from cim_to_stix import IoCCategory

logger = get_logger_for_script(__file__)

class ListIndicatorCategoriesHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        return {
            "categories": [x.value for x in IoCCategory],
        }
