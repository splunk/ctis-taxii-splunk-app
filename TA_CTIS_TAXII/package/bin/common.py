import abc
import json
import logging
import os
import sys
from collections import defaultdict
from enum import Enum
from typing import Any, Dict, List, Optional

from cattrs import ClassValidationError
from solnlib._utils import get_collection_data
from splunklib.client import KVStoreCollectionData
from stix2 import Bundle
from taxii2client.v21 import ApiRoot, Collection, _TAXIIEndpoint

from const import ADDON_NAME, ADDON_NAME_LOWER
from models import GroupingModelV1, IdentityModelV1, IndicatorModelV1, SubmissionModelV1, SubmissionStatus, \
    bundle_for_grouping, grouping_converter, identity_converter, indicator_converter, serialize_stix_object, \
    submission_converter
from server_exception import ServerException

APP_DIR = os.path.dirname(os.path.dirname(__file__))
sys.stderr.write(f"APP_DIR: {APP_DIR}\n")

NAMESPACE = os.path.basename(APP_DIR)
sys.stderr.write(f"NAMESPACE: {NAMESPACE}\n")


def get_logger_for_script(script_filepath: str) -> logging.Logger:
    import solnlib
    script_name = os.path.basename(script_filepath)
    app_logger = solnlib.log.Logs().get_logger(f"{NAMESPACE}.{script_name}")
    app_logger.setLevel(logging.DEBUG)
    return app_logger


def add_request_response_logging_hook(taxii_endpoint: _TAXIIEndpoint, app_logger: logging.Logger):
    session = taxii_endpoint._conn.session
    def log_http_response(response, *args, **kwargs):
        req = response.request
        app_logger.info(f"HTTP Request: {req.method} {req.url}, body={req.body}")
        app_logger.info(f"HTTP Response: {response.status_code} {response.reason} for {response.url}")
    session.hooks["response"].append(log_http_response)

class CollectionName(Enum):
    GROUPINGS = "groupings"
    INDICATORS = "indicators"
    IDENTITIES = "identities"
    SUBMISSIONS = "submissions"

class KVStoreObjectDocumentMapping:
    def __init__(self, logger, session_key: str, app_namespace: str):
        self.logger = logger
        self.session_key = session_key
        self.app_namespace = app_namespace
        self.collection_name_to_model_and_converter = {
            CollectionName.GROUPINGS: (GroupingModelV1, grouping_converter),
            CollectionName.INDICATORS: (IndicatorModelV1, indicator_converter),
            CollectionName.IDENTITIES: (IdentityModelV1, identity_converter),
            CollectionName.SUBMISSIONS: (SubmissionModelV1, submission_converter),
        }

    def get_collection(self, collection_name: str):
        return get_collection_data(collection_name=collection_name, session_key=self.session_key, app=self.app_namespace)

    def list_collection_structured(self, collection_name: CollectionName, query: dict) -> List[Any]:
        assert collection_name in self.collection_name_to_model_and_converter
        model_class, converter = self.collection_name_to_model_and_converter[collection_name]
        collection = self.get_collection(collection_name=collection_name.value)
        records = collection.query(query=query, limit=0, skip=0)
        records_structured = [converter.structure(record, model_class) for record in records]
        return records_structured

    def get_exactly_one_record_structured(self, collection_name: CollectionName, query: dict) -> Any:
        structured_records = self.list_collection_structured(collection_name=collection_name, query=query)
        num_records = len(structured_records)
        assert num_records > 0, f"No records found for query: {query}"
        assert num_records == 1, f"More than one record found for query: {query}"
        return structured_records[0]

    def list_grouping_indicators(self, grouping_id: str) -> List[IndicatorModelV1]:
        return self.list_collection_structured(collection_name=CollectionName.INDICATORS, query={"grouping_id": grouping_id})

class KVStoreCollectionUtils:
    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def get_collection_size(self, collection: KVStoreCollectionData, query=None) -> int:
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
            # TODO: Make this more dynamic, considering custom set max page size in limits.conf
            #  Consider `offset += len(page_of_records)` instead of fixed page_size
            offset += page_size
        total_records = len(records)
        self.logger.info(f"Total records found: {total_records}")
        return total_records

    def query_exactly_one_record(self, collection: KVStoreCollectionData, query: dict) -> dict:
        results = collection.query(query=query)
        assert type(results) == list
        num_results = len(results)
        self.logger.info(f"Querying collection={collection} with query={query}. num_results={num_results}")
        assert num_results > 0, f"No records found for query: {query}"
        assert num_results == 1, f"More than one record found for query: {query}"
        return results[0]



class AbstractRestHandler(abc.ABC):
    def __init__(self, logger):
        self.logger = logger

    @abc.abstractmethod
    def handle(self, input_json: Optional[dict], query_params: Dict[str, List], session_key: str) -> dict:
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

    def get_instance_of_kvstore_odm(self, session_key: str) -> KVStoreObjectDocumentMapping:
        return KVStoreObjectDocumentMapping(session_key=session_key, app_namespace=NAMESPACE, logger=self.logger)

    def get_taxii_config(self, session_key: str, stanza_name: str):
        from solnlib import conf_manager
        conf_name = f"{ADDON_NAME_LOWER}_taxii_config"
        cfm = conf_manager.ConfManager(
            session_key,
            ADDON_NAME,
            realm=f"__REST_CREDENTIAL__#{ADDON_NAME}#configs/conf-{conf_name}",
        )
        self.logger.info(f"Getting conf_file={conf_name} stanza={stanza_name}")
        taxii_config_conf = cfm.get_conf(conf_name)
        return taxii_config_conf.get(stanza_name)

    def get_api_root(self, url: str, user: str, password: str) -> ApiRoot:
        api_root = ApiRoot(url=url, user=user, password=password)
        add_request_response_logging_hook(taxii_endpoint=api_root, app_logger=self.logger)
        return api_root

    def get_taxii_collection(self, taxii_config: dict, collection_id: str) -> Collection:
        api_root = self.get_api_root(url=taxii_config["api_root_url"], user=taxii_config["username"],
                                password=taxii_config["password"])

        collection_id_to_collection = {c.id: c for c in api_root.collections}
        if collection_id not in collection_id_to_collection:
            raise ValueError(f"Collection ID {collection_id} not found in TAXII server.")
        return collection_id_to_collection[collection_id]

    def submit_grouping(self, session_key: str, submission_id: str) -> dict:
        submissions_collection = self.get_collection(session_key=session_key, collection_name="submissions")
        taxii_response_dict = None
        error = None
        bundle_json = None
        try:
            submission = self.query_exactly_one_record(collection=submissions_collection, query={"submission_id": submission_id})
            bundle = self.generate_stix_bundle_for_grouping(grouping_id=submission["grouping_id"], session_key=session_key)
            bundle_json = serialize_stix_object(stix_object=bundle)

            taxii_config = self.get_taxii_config(session_key=session_key, stanza_name=submission["taxii_config_name"])
            taxii_collection_id = submission["collection_id"]

            self.logger.info(f"Submitting bundle={bundle_json} to TAXII collection: collection_id={taxii_collection_id}")
            taxii_collection = self.get_taxii_collection(taxii_config=taxii_config, collection_id=taxii_collection_id)
            taxii_response = taxii_collection.add_objects(bundle_json)
            taxii_response_dict = taxii_response._raw
            self.logger.info(f"taxii_response: {taxii_response_dict}")
        except Exception as e:
            self.logger.exception(f"Failed to submit to TAXII collection: {e}")
            error = str(e)

        submission_delta = {
            "bundle_json_sent": bundle_json,
            "response_json": json.dumps(taxii_response_dict) if taxii_response_dict else None,
            "error_message": error,
            "status": SubmissionStatus.FAILED.value if error else SubmissionStatus.SENT.value,
        }
        updated_submission = self.update_record(collection=submissions_collection,
                                                query_for_one_record={"submission_id": submission_id},
                                                input_json=submission_delta,
                                                converter=submission_converter, model_class=SubmissionModelV1)
        return updated_submission

    def get_kvstore_collection_utils_instance(self) -> KVStoreCollectionUtils:
        return KVStoreCollectionUtils(logger=self.logger)

    def handle_query_collection(self, input_json: Optional[dict], query_params: Dict[str, List], session_key: str,
                                collection_name: str) -> dict:
        self.logger.info(f"input_json: {input_json}")
        self.logger.info(f"query_params: {query_params}")

        collection_query_kwargs = self.extract_collection_query_kwargs(query_params)

        collection = self.get_collection(collection_name=collection_name, session_key=session_key)
        self.logger.info(f"Collection: {collection}")
        self.logger.info(f"Collection query kwargs: {collection_query_kwargs}")
        records = collection.query(**collection_query_kwargs)
        self.logger.info(f"Records found: {len(records)}")

        total_records = self.get_kvstore_collection_utils_instance().get_collection_size(collection=collection, query=collection_query_kwargs.get("query"))
        response = {
            "records": records,
            "total": total_records,
        }
        return response

    @staticmethod
    def prepare_merged_model_instance(saved_record: dict, input_json: dict, converter, model_class):
        merged = {**saved_record, **input_json}
        structured = converter.structure(merged, model_class)
        return structured

    def query_exactly_one_record(self, collection, query: dict) -> dict:
        results = collection.query(query=query)
        self.logger.info(f"Results: {results}")
        assert len(results) > 0, f"No records found for query: {query}"
        assert len(results) == 1, f"More than one record found for query: {query}"
        return results[0]

    def delete_record(self, collection, query: dict):
        saved_record = self.query_exactly_one_record(collection, query=query)
        self.logger.info(f"Deleting record: {saved_record}")
        collection.delete_by_id(id=saved_record["_key"])

    def insert_record(self, collection, input_json: dict, converter, model_class) -> dict:
        try:
            structured = converter.structure(input_json, model_class)
        except Exception as exc:
            self.logger.exception(f"Failed to convert input JSON to Model")
            raise ValueError(repr(exc))

        record_as_dict = converter.unstructure(structured)
        self.logger.info(f"Inserting record into collection {collection}: {record_as_dict}")
        collection.insert(record_as_dict)

        return record_as_dict

    def update_record(self, collection, query_for_one_record: dict, input_json: dict, converter, model_class) -> dict:
        saved_record = self.query_exactly_one_record(collection, query=query_for_one_record)
        try:
            structured = self.prepare_merged_model_instance(saved_record=saved_record, input_json=input_json,
                                                            converter=converter, model_class=model_class)
        except ClassValidationError as exc:
            self.logger.exception(f"Validation failed on merged model instance: {exc}")
            raise exc

        structured.set_modified_to_now()

        updated_record_as_dict = converter.unstructure(structured)

        self.logger.info(f"Updating record: {updated_record_as_dict}")

        collection.update(id=structured.key, data=updated_record_as_dict)

        return updated_record_as_dict

    def update_grouping_modified_time_to_now(self, grouping_id: str, session_key: str):
        groupings = self.get_collection(collection_name="groupings", session_key=session_key)
        self.update_record(collection=groupings,
                           query_for_one_record={"grouping_id": grouping_id},
                           input_json={},
                           converter=grouping_converter,
                           model_class=GroupingModelV1)

    @staticmethod
    def exception_response(e: Exception, status_code: int) -> dict:
        return {"payload": {"error": str(e)}, "status": status_code}

    @staticmethod
    def parse_query_params(query: list) -> dict:
        params = defaultdict(list)
        for a, b in query:
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
        if "fields" in query_params:
            collection_query_kwargs["fields"] = query_params["fields"][0]
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
            query_params_dict = self.parse_query_params(in_string_dict["query"])
            payload = self.handle(input_json=input_json, query_params=query_params_dict, session_key=session_key)
            return {"payload": payload, "status": 200}
        except (ValueError, AssertionError) as e:
            self.logger.exception("Client error")
            return self.exception_response(e, 400)
        except ServerException as e:
            self.logger.exception(e)
            return {"payload": {"error": str(e), "errors": e.errors}, "status": 400}
        except ClassValidationError as e:
            self.logger.exception("Validation Error")
            return {"payload":
                        {"error": f"Validation Error: {e}",
                         "errors": [str(err) for err in e.exceptions] },
                    "status": 400 }
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

    def generate_stix_bundle_for_grouping(self, grouping_id:str, session_key:str) -> Bundle:
        odm = self.get_instance_of_kvstore_odm(session_key=session_key)

        grouping = odm.get_exactly_one_record_structured(collection_name=CollectionName.GROUPINGS, query={"grouping_id": grouping_id})
        self.logger.info(f"grouping: {grouping}")

        indicators = odm.list_grouping_indicators(grouping_id=grouping_id)
        self.logger.info(f"indicators: {indicators}")

        identity = odm.get_exactly_one_record_structured(collection_name=CollectionName.IDENTITIES, query={"identity_id": grouping.created_by_ref})
        self.logger.info(f"identity: {identity}")

        bundle = bundle_for_grouping(grouping_=grouping, indicators=indicators, grouping_identity=identity)
        return bundle
