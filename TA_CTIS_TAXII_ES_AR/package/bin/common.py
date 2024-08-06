import logging
import os
import sys
import json
import solnlib

APP_DIR = os.path.dirname(os.path.dirname(__file__))
sys.stderr.write(f"APP_DIR: {APP_DIR}\n")

NAMESPACE = os.path.basename(APP_DIR)
sys.stderr.write(f"NAMESPACE: {NAMESPACE}\n")


def get_logger_for_script(script_filepath: str) -> logging.Logger:
    script_name = os.path.basename(script_filepath)
    return solnlib.log.Logs().get_logger(f"{NAMESPACE}.{script_name}")


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
