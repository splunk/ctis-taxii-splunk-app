import json
import logging
import os
import sys
import abc
from typing import Optional, Dict, List
from collections import defaultdict

from solnlib._utils import get_collection_data

from server_exception import ServerException

APP_DIR = os.path.dirname(os.path.dirname(__file__))
sys.stderr.write(f"APP_DIR: {APP_DIR}\n")

NAMESPACE = os.path.basename(APP_DIR)
sys.stderr.write(f"NAMESPACE: {NAMESPACE}\n")


def get_logger_for_script(script_filepath: str) -> logging.Logger:
    import solnlib
    script_name = os.path.basename(script_filepath)
    return solnlib.log.Logs().get_logger(f"{NAMESPACE}.{script_name}")


class AbstractRestHandler(abc.ABC):
    def __init__(self, logger):
        self.logger = logger

    @abc.abstractmethod
    def handle(self, input_json: Optional[dict], query_params:Dict[str, List], session_key:str) -> dict:
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

    def handle_query_collection(self, input_json: Optional[dict], query_params:Dict[str, List], session_key:str, collection_name:str) -> dict:
        self.logger.info(f"input_json: {input_json}")
        self.logger.info(f"query_params: {query_params}")

        collection_query_kwargs = self.extract_collection_query_kwargs(query_params)

        collection = self.get_collection(collection_name=collection_name, session_key=session_key)
        self.logger.info(f"Collection: {collection}")
        self.logger.info(f"Collection query kwargs: {collection_query_kwargs}")
        records = collection.query(**collection_query_kwargs)
        self.logger.info(f"Records found: {len(records)}")

        total_records = self.get_collection_size(collection, query=collection_query_kwargs.get("query"))
        response = {
            "records": records,
            "total": total_records,
        }
        return response

    @staticmethod
    def exception_response(e: Exception, status_code: int) -> dict:
        return {"payload": {"error": str(e)}, "status": status_code}

    @staticmethod
    def parse_query_params(query: list) -> dict:
        params = defaultdict(list)
        for a,b in query:
            params[a].append(b)
        return params

    @staticmethod
    def get_first_query_param_value(query_params: dict, key: str) -> Optional[str]:
        if key in query_params:
            value = query_params.get(key)
            if type(value) == list:
                return query_params[key][0]
            else:
                return value

    def get_collection_size(self, collection, query=None) -> int:
        #  https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTkvstore#storage.2Fcollections.2Fdata.2F.7Bcollection.7D
        collection_query_kwargs = {}
        if query:
            collection_query_kwargs["query"] = query
        records = []
        offset = 0
        page_size = 50000
        while True:
            page_of_records = collection.query(fields="_key", limit=page_size, skip=offset, **collection_query_kwargs)
            records.extend(page_of_records)
            if len(page_of_records) == 0:
                break
            offset += page_size
        total_records = len(records)
        self.logger.info(f"Total records found: {total_records}")
        return total_records

    @staticmethod
    def extract_collection_query_kwargs(query_params: dict) -> dict:
        collection_query_kwargs = {}
        if "sort" in query_params:
            collection_query_kwargs["sort"] = query_params["sort"][0]
        if "limit" in query_params:
            collection_query_kwargs["limit"] = int(query_params["limit"][0])
        if "skip" in query_params:
            collection_query_kwargs["skip"] = int(query_params["skip"][0])
        if "query" in query_params:
            collection_query_kwargs["query"] = query_params["query"][0]
        return collection_query_kwargs

    @staticmethod
    def get_collection(collection_name: str, session_key: str):
        return get_collection_data(collection_name=collection_name, session_key=session_key, app=NAMESPACE)

    def generate_response(self, in_string: str) -> dict:
        try:
            self.logger.info(f"Handling request with input: {in_string}")
            in_string_dict = json.loads(in_string)
            input_json = json.loads(in_string_dict["payload"]) if "payload" in in_string_dict else None
            session_key = in_string_dict["session"]["authtoken"]
            # remote_pdb.RemotePdb(host="0.0.0.0", port=4444).set_trace()
            query_params_dict = self.parse_query_params(in_string_dict["query"])
            payload = self.handle(input_json=input_json, query_params=query_params_dict, session_key=session_key)
            return {"payload": payload, "status": 200}
        except AssertionError as e:
            self.logger.exception("Client error")
            return self.exception_response(e, 400)
        except ServerException as e:
            self.logger.exception(e)
            return {"payload": {"error" : str(e), "errors": e.errors}, "status": 400}
        except Exception as e:
            self.logger.exception("Server error")
            return self.exception_response(e, 500)

    def generate_splunk_server_class(self):
        from splunk.persistconn.application import PersistentServerConnectionApplication
        outer_self = self

        # https://dev.splunk.com/enterprise/docs/devtools/customrestendpoints/customrestscript
        class Handler(PersistentServerConnectionApplication):
            def __init__(cls_self, _command_line, _command_arg):
                super(PersistentServerConnectionApplication, cls_self).__init__()

            def handle(cls_self, in_string):
                return outer_self.generate_response(in_string)

        return Handler
