import logging
from abc import ABC, abstractmethod
from typing import Dict, Generic, List, Optional, Type, TypeVar

from cattrs import Converter
import attrs
from solnlib._utils import get_collection_data
from splunklib.client import KVStoreCollectionData

from .collection_name import CollectionName
from ..base import BaseModelV1

T = TypeVar("T", bound=BaseModelV1)


# TODO: Logger should ideally be defined per file (not shared).
#  Figure out how to setup log handlers to properly to do this.
class AbstractKVStoreCollection(ABC, Generic[T]):
    def __init__(self, logger: logging.Logger, session_key: str, app_namespace: str):
        self.logger = logger
        self.session_key = session_key
        self.app_namespace = app_namespace

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
    def collection(self) -> KVStoreCollectionData:
        return get_collection_data(collection_name=self.collection_name.value, session_key=self.session_key, app=self.app_namespace)

    def fetch_exactly_one_raw(self, query: Dict) -> Dict:
        records = list(self.collection.query(query=query))
        assert len(records) > 0, f"No records found for query: {query}"
        assert len(records) == 1, f"More than one record found for query: {query}"
        return records[0]

    def delete_exactly_one(self, query: Dict) -> str:
        """
        Return the _key of the deleted record.
        """
        record = self.fetch_exactly_one_structured(query=query)
        delete_http_resp = self.collection.delete_by_id(id=record.key)

        self.logger.info(f"Deleted record with _key: {record.key}, response: {delete_http_resp}")
        return record.key

    def fetch_exactly_one_structured(self, query: Dict) -> T:
        record = self.fetch_exactly_one_raw(query=query)
        structured = self.model_converter.structure(record, self.model_class)
        return structured

    def fetch_many_raw(self, query: Dict, limit=0, skip=0) -> List[Dict]:
        return list(self.collection.query(query=query, limit=limit, skip=skip))

    def fetch_many_structured(self, query: dict) -> List[T]:
        return [self.model_converter.structure(record, self.model_class) for record in self.fetch_many_raw(query=query)]

    def update_one_structured(self, query: Dict, updates: Dict) -> T:
        """
        Update a single record identified by the query with the provided updates which is a dict of key-values.
        Note that the updates are applied to the structured record.
        Has side effect of updating the `modified` field to the current time.
        Returns the updated structured record.
        """
        record = self.fetch_exactly_one_structured(query=query)
        self.logger.info(f"Record before update: {record}")
        record_updated = attrs.evolve(record, **updates)
        record_updated.set_modified_to_now()
        self.logger.info(f"Record after update: {record_updated}")
        self.collection.update(id=record.key, data=self.model_converter.unstructure(record_updated))
        return record_updated

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
            self.logger.info(f"Querying collection with: {collection_query_kwargs}")
            page_of_records = self.collection.query(**collection_query_kwargs)
            self.logger.info(f"Fetched {len(page_of_records)} records for {collection_query_kwargs}")
            records.extend(page_of_records)
            if len(page_of_records) == 0:
                break
            # TODO: Make this more dynamic, considering custom set max page size in limits.conf
            #  Consider `offset += len(page_of_records)` instead of fixed page_size
            offset += len(page_of_records)
        total_records = len(records)
        self.logger.info(f"Total records found: {total_records}")
        return total_records
