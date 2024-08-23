import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler
    from cim_to_stix import convert_to_stix_pattern, IoCCategory
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class Handler(AbstractRestHandler):
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



SuggestStixPatternHandler = Handler(logger=logger).generate_splunk_server_class()
