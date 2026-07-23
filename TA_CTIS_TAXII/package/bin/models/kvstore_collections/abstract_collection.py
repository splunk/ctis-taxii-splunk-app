import logging
from abc import ABC, abstractmethod
from typing import Dict, Generic, List, Optional, Type, TypeVar
import json

from cattrs import Converter
import attrs
from solnlib._utils import get_collection_data
from splunklib.client import KVStoreCollectionData

from .collection_name import CollectionName
from ..base import BaseModelV1

T = TypeVar("T", bound=BaseModelV1)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)



class AbstractKVStoreCollection(ABC, Generic[T]):
    def __init__(self, session_key: str, app_namespace: str):
        self.session_key = session_key
        self.app_namespace = app_namespace


    @staticmethod
    def query_or(operands: List[Dict]) -> Dict:
        return {"$or": operands}

    @staticmethod
    def query_in(field: str, possible_values: List[str]) -> Dict:
        return AbstractKVStoreCollection.query_or([{field: value} for value in possible_values])

    @property
    @abstractmethod
    def model_class(self) -> Type[T]:
        pass

    @property
    @abstractmethod
    def model_converter(self) -> Converter:
        pass

    @property
    @abstractmethod
    def collection_name(self) -> CollectionName:
        pass

    @property
    @abstractmethod
    def primary_key(self) -> str:
        pass

    @property
    def collection(self) -> KVStoreCollectionData:
        return get_collection_data(collection_name=self.collection_name.value, session_key=self.session_key, app=self.app_namespace)

    def fetch_exactly_one_raw(self, query: Dict) -> Dict:
        records = list(self.collection.query(query=query))
        assert len(records) > 0, f"No records found for collection={self.collection_name}, query={query}"
        assert len(records) == 1, f"More than one record found for collection={self.collection_name}, query={query}"
        return records[0]

    def delete_exactly_one(self, query: Dict) -> str:
        """
        Return the _key of the deleted record.
        """
        record = self.fetch_exactly_one_structured(query=query)
        # https://github.com/splunk/splunk-sdk-python/blob/2.1.1/splunklib/client.py#L4077
        delete_http_resp = self.collection.delete_by_id(id=record.key)

        logger.info(f"Deleted record with _key: {record.key}, response: {delete_http_resp}")
        return record.key

    def delete_many(self, query: Dict):
        # https://help.splunk.com/en/splunk-cloud-platform/leverage-rest-apis/rest-api-reference/10.5.2605/kv-store-endpoints/kv-store-endpoint-descriptions#delete-1
        delete_http_resp = self.collection.delete(query=json.dumps(query))
        return str(delete_http_resp)

    def delete_many_by_primary_key(self, primary_key_values: List[str]):
        records_to_delete = self.fetch_many_structured_by_primary_key(possible_values_of_primary_key=primary_key_values)
        for record in records_to_delete:
            logger.info(f"Deleting record: {record}")
        query = self.query_in(field=self.primary_key, possible_values=primary_key_values)
        return self.delete_many(query=query)

    def check_if_exactly_one_exists(self, query: Dict) -> bool:
        try:
            self.fetch_exactly_one_structured(query=query)
            return True
        except AssertionError:
            logger.exception(f"Record does not exist or more than one record exists for query={query}")
            return False

    def check_if_any_exists(self, primary_key_value: str) -> bool:
        fetched = self.fetch_many_raw(query={self.primary_key: primary_key_value})
        return len(fetched) > 0

    def fetch_exactly_one_structured(self, query: Dict) -> T:
        record = self.fetch_exactly_one_raw(query=query)
        structured = self.model_converter.structure(record, self.model_class)
        return structured

    def fetch_many_raw(self, query: Dict, limit=0, skip=0) -> List[Dict]:
        logger.info(f"fetch_many_raw: query={query}, limit={limit}, skip={skip}")
        return list(self.collection.query(query=query, limit=limit, skip=skip))

    def fetch_many_structured(self, query: dict) -> List[T]:
        return [self.model_converter.structure(record, self.model_class) for record in self.fetch_many_raw(query=query)]

    def fetch_many_structured_by_primary_key(self, possible_values_of_primary_key: List) -> List[T]:
        query = self.query_in(field=self.primary_key, possible_values=possible_values_of_primary_key)
        return self.fetch_many_structured(query=query)

    def update_one_structured(self, query: Dict, updates: Dict) -> T:
        """
        Update a single record identified by the query with the provided updates which is a dict of key-values.
        Note that the updates are applied to the structured record, so keep in mind for any Enums.
        Has side effect of updating the `modified` field to the current time.
        Returns the updated structured record.
        """
        record = self.fetch_exactly_one_structured(query=query)
        logger.info(f"Record before update: {record}")
        record_updated = attrs.evolve(record, **updates)
        return self.update_record(record=record_updated)

    def insert_record(self, record: T) -> dict:
        primary_key_value = getattr(record, self.primary_key)
        assert primary_key_value is not None, f"Primary key of {self.primary_key} on {record} does not exist"
        if self.check_if_any_exists(primary_key_value=primary_key_value):
            raise ValueError(f"Record in collection={self.collection_name} with {self.primary_key}={primary_key_value} already exists.")
        unstructured = self.model_converter.unstructure(record)
        self.collection.insert(unstructured)
        logger.info(f"Record inserted into collection={self.collection_name}: structured={record} unstructured={unstructured}")
        return unstructured

    def any_exists(self, records: List[T]) -> bool:
        """
        Returns whether any records with given primary key exist in the collection.
        """
        primary_keys = []
        for record in records:
            pk = getattr(record, self.primary_key)
            assert pk is not None, f"Expected primary key of {self.primary_key} on {record} to be non-null."
            primary_keys.append(pk)
        return self.any_exists_by_primary_key(primary_key_values=primary_keys)

    def any_exists_by_primary_key(self, primary_key_values: List[str]) -> bool:
        logger.info(f"Checking if any records exist for primary keys: {primary_key_values}")
        existing_records = self.fetch_many_structured_by_primary_key(possible_values_of_primary_key=primary_key_values)
        return len(existing_records) > 0

    def insert_many_structured(self, records: List[T]) -> List[Dict]:
        assert not self.any_exists(records=records)
        unstructured_records = [self.model_converter.unstructure(x) for x in records]
        # batch_save() returns a list of new record keys
        resp = self.collection.batch_save(*unstructured_records)
        logger.info(f"New record keys inserted into collection={self.collection_name}: {resp}")
        return unstructured_records

    def update_record(self, record: T) -> T:
        record.set_modified_to_now()
        logger.info(f"Record after update: {record}")
        self.collection.update(id=record.key, data=self.model_converter.unstructure(record))
        return record

    def update_one_raw(self, query: Dict, raw_updates: Dict) -> Dict:
        updated_structured = self.preview_updated_structured(query=query, raw_updates=raw_updates)
        self.update_record(record=updated_structured)
        updated_raw = self.model_converter.unstructure(updated_structured)
        logger.info(f"Updated raw record: {updated_raw}")
        return updated_raw

    def preview_updated_structured(self, query: Dict, raw_updates: Dict) -> T:
        """
        Fetch exactly one record and returns an updated structured record without writing any changes to the database.
        Note that any enum values in raw_updates should be the enum values (i.e. strings) and not the enum types.
        """
        record = self.fetch_exactly_one_raw(query=query)
        logger.info(f"Record before update: {record}")
        merged_record_raw = {**record, **raw_updates}
        logger.info(f"Merged raw record: {merged_record_raw}")
        return self.model_converter.structure(merged_record_raw, self.model_class)

    def get_collection_size(self, query: Optional[Dict] = None) -> int:
        #  https://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTkvstore#storage.2Fcollections.2Fdata.2F.7Bcollection.7D
        records = []
        offset = 0

        # limits.conf -> [kvstore] -> max_rows_per_query
        # https://docs.splunk.com/Documentation/Splunk/9.4.2/Admin/Limitsconf#.5Bkvstore.5D
        page_size = 50000 # As initial guess of max, adjusted based on response results size
        while True:
            collection_query_kwargs = {
                "fields" : "_key",
                "limit": page_size,
                "skip": offset,
            }
            if query:
                collection_query_kwargs["query"] = query
            logger.info(f"Querying collection with: {collection_query_kwargs}")
            page_of_records = self.collection.query(**collection_query_kwargs)
            logger.info(f"Fetched {len(page_of_records)} records for {collection_query_kwargs}")
            records.extend(page_of_records)
            if len(page_of_records) == 0:
                break
            # TODO: Make this more dynamic, considering custom set max page size in limits.conf
            #  Consider `offset += len(page_of_records)` instead of fixed page_size
            offset += len(page_of_records)
        total_records = len(records)
        logger.info(f"Total records found: {total_records}")
        return total_records
