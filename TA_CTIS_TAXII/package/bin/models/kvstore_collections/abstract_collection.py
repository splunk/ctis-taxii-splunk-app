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

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class AbstractKVStoreCollection(ABC, Generic[T]):
    def __init__(self, session_key: str, app_namespace: str):
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
        assert len(records) > 0, f"No records found for collection={self.collection_name}, query={query}"
        assert len(records) == 1, f"More than one record found for collection={self.collection_name}, query={query}"
        return records[0]

    def delete_exactly_one(self, query: Dict) -> str:
        """
        Return the _key of the deleted record.
        """
        record = self.fetch_exactly_one_structured(query=query)
        delete_http_resp = self.collection.delete_by_id(id=record.key)

        logger.info(f"Deleted record with _key: {record.key}, response: {delete_http_resp}")
        return record.key

    def check_if_exactly_one_exists(self, query: Dict) -> bool:
        try:
            self.fetch_exactly_one_structured(query=query)
            return True
        except AssertionError:
            logger.exception(f"Record does not exist or more than one record exists for query={query}")
            return False

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
        Note that the updates are applied to the structured record, so keep in mind for any Enums.
        Has side effect of updating the `modified` field to the current time.
        Returns the updated structured record.
        """
        record = self.fetch_exactly_one_structured(query=query)
        logger.info(f"Record before update: {record}")
        record_updated = attrs.evolve(record, **updates)
        return self.update_record(record=record_updated)

    def update_record(self, record: T) -> T:
        record.set_modified_to_now()
        logger.info(f"Record after update: {record}")
        self.collection.update(id=record.key, data=self.model_converter.unstructure(record))
        return record

    def update_one_raw(self, query: Dict, raw_updates: Dict) -> Dict:
        """
        Note that any enum values in raw_updates should be the enum values (i.e. strings) and not the enum types.
        """
        record = self.fetch_exactly_one_raw(query=query)
        logger.info(f"Record before update: {record}")
        merged_record_raw = {**record, **raw_updates}
        logger.info(f"Merged raw record: {merged_record_raw}")
        merged_structured = self.model_converter.structure(merged_record_raw, self.model_class)
        updated_structured = self.update_record(record=merged_structured)
        updated_raw = self.model_converter.unstructure(updated_structured)
        logger.info(f"Updated raw record: {updated_raw}")
        return updated_raw

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
