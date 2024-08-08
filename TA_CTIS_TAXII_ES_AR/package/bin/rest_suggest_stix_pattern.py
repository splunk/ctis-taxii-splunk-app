import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler
    from cim_to_stix import convert_cim_to_stix2_pattern
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

from splunk.persistconn.application import PersistentServerConnectionApplication

logger = get_logger_for_script(__file__)


class Handler(AbstractRestHandler):
    def handle(self, input_json: dict) -> dict:
        field_name = input_json.get("splunk_field_name")
        assert field_name, "splunk_field_name is required"

        field_value = input_json.get("splunk_field_value")
        assert field_value, "splunk_field_value is required"

        generated_pattern = convert_cim_to_stix2_pattern(field_name, field_value)
        response = {
            "pattern": generated_pattern
        }
        return response


class SuggestStixPatternHandler(PersistentServerConnectionApplication):
    def __init__(self, _command_line, _command_arg):
        super(PersistentServerConnectionApplication, self).__init__()

    def handle(self, in_string):
        """
        Called for a simple synchronous request.
        @param in_string: request data passed in
        @rtype: string or dict
        @return: String to return in response.  If a dict was passed in,
                 it will automatically be JSON encoded before being returned.
        """
        """
        Sample in_string:
        {
              "output_mode": "json",
              "output_mode_explicit": true,
              "server": {
                "rest_uri": "https://127.0.0.1:8089",
                "hostname": "XG6CM0P360",
                "servername": "XG6CM0P360",
                "guid": "D7249C54-D20F-4893-9031-C2C1B079B54B"
              },
              "restmap": {
                "name": "script:suggest-stix-pattern",
                "conf": {
                  "handler": "rest_suggest_stix_pattern.SuggestStixPatternHandler",
                  "match": "/suggest-stix-pattern",
                  "passPayload": "true",
                  "python.version": "python3",
                  "script": "rest_suggest_stix_pattern.py",
                  "scripttype": "persist"
                }
              },
              "query": [
                [
                  "key",
                  "val"
                ]
              ],
              "connection": {
                "src_ip": "127.0.0.1",
                "ssl": true,
                "listening_port": 8089
              },
              "session": {
                "user": "admin",
                "authtoken": "abc1234"
              },
              "rest_path": "/suggest-stix-pattern",
              "method": "POST",
              "ns": {
                "app": "TA_CTIS_TAXII_ES_AR_2"
              },
              "form": [

              ],
              "payload": "{\\n    \\"hello\\" : \\"world\\"\\n}"
        }
        """
        return Handler(logger=logger).generate_response(in_string)
