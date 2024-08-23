import os
import sys

sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler
    from cim_to_stix import convert_splunk_field_to_category, IoCCategory
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)


class Handler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        field_name = self.get_first_query_param_value(query_params=query_params, key="splunk_field_name")
        field_value = self.get_first_query_param_value(query_params=query_params, key="splunk_field_value")
        all_categories = [x.value for x in IoCCategory]
        suggested_category = None
        try:
            if field_name and field_value:
                suggested_category = convert_splunk_field_to_category(splunk_field_name=field_name,
                                                                      splunk_field_value=field_value).value
        except ValueError:
            self.logger.warning(f"Could not determine category for field_name={field_name}, field_value={field_value}")
        response = {
            "categories": all_categories,
            "suggested": suggested_category
        }
        return response


ListIndicatorCategoriesHandler = Handler(logger=logger).generate_splunk_server_class()
