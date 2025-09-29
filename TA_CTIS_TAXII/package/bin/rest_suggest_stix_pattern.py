from cim_to_stix import IoCCategory, convert_to_stix_pattern
from common import AbstractRestHandler, get_logger_for_script

logger = get_logger_for_script(__file__)

class SuggestStixPatternHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params:dict, session_key: str) -> dict:
        category = input_json.get("indicator_category")
        assert category, "indicator_category is required"

        value = input_json.get("indicator_value")
        assert value, "indicator_value is required"

        category_enum = IoCCategory(category)
        generated_pattern = convert_to_stix_pattern(category=category_enum, value=value)
        response = {
            "pattern": generated_pattern
        }
        return response
