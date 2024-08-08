import json
import logging
import os
import sys
import abc

# External libraries
import solnlib

APP_DIR = os.path.dirname(os.path.dirname(__file__))
sys.stderr.write(f"APP_DIR: {APP_DIR}\n")

NAMESPACE = os.path.basename(APP_DIR)
sys.stderr.write(f"NAMESPACE: {NAMESPACE}\n")


def get_logger_for_script(script_filepath: str) -> logging.Logger:
    script_name = os.path.basename(script_filepath)
    return solnlib.log.Logs().get_logger(f"{NAMESPACE}.{script_name}")


class AbstractRestHandler(abc.ABC):
    def __init__(self, logger):
        self.logger = logger

    @abc.abstractmethod
    def handle(self, input_json: dict) -> dict:
        """
        Return any dict response or throw an exception.
        This will be wrapped by a common wrapper method.
        """
        pass

    @staticmethod
    def get_json_payload(in_string: str) -> dict:
        """
        Where in_string is a JSON encoded string with a key "payload".
        The value associated with the key "payload" is also a JSON encoded string.
        Requires that restmap.conf has passPayload=true.
        """
        in_string_dict = json.loads(in_string)
        payload_json = in_string_dict["payload"]
        input_payload = json.loads(payload_json)
        return input_payload

    @staticmethod
    def exception_response(e: Exception, status_code: int) -> dict:
        return {"payload": {"error": str(e)}, "status": status_code}

    def generate_response(self, in_string: str) -> dict:
        try:
            self.logger.info(f"Handling request with input: {in_string}")
            input_json = self.get_json_payload(in_string)
            payload = self.handle(input_json)
            return {"payload": payload, "status": 200}
        except AssertionError as e:
            self.logger.exception("Client error")
            return self.exception_response(e, 400)
        except Exception as e:
            self.logger.exception("Server error")
            return self.exception_response(e, 500)
