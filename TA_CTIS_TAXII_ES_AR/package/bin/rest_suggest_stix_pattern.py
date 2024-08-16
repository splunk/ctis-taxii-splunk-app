import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler
    from cim_to_stix import convert_cim_to_stix2_pattern
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class Handler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params:dict, session_key: str) -> dict:
        field_name = input_json.get("splunk_field_name")
        assert field_name, "splunk_field_name is required"

        field_value = input_json.get("splunk_field_value")
        assert field_value, "splunk_field_value is required"

        generated_pattern = convert_cim_to_stix2_pattern(field_name, field_value)
        response = {
            "pattern": generated_pattern
        }
        return response


SuggestStixPatternHandler = Handler(logger=logger).generate_splunk_server_class()
