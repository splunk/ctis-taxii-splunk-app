from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..grouping import GroupingModelV1, grouping_converter
from cattrs import Converter
from typing import Dict, Type

class GroupingsCollection(AbstractKVStoreCollection[GroupingModelV1]):
    ID_FIELD = "grouping_id"

    @property
    def model_class(self) -> Type[GroupingModelV1]:
        return GroupingModelV1

    @property
    def model_converter(self) -> Converter:
        return grouping_converter

    @property
    def collection_name(self) -> CollectionName:
        return CollectionName.GROUPINGS

    def get_grouping(self, grouping_id: str) -> GroupingModelV1:
        return self.fetch_exactly_one_structured(query={GroupingsCollection.ID_FIELD: grouping_id})

    def update_grouping_structured(self, grouping_id: str, updates: Dict) -> GroupingModelV1:
        return self.update_one_structured(query={GroupingsCollection.ID_FIELD: grouping_id}, updates=updates)

    def update_grouping_raw(self, grouping_id: str, updates: Dict) -> Dict:
        return self.update_one_raw(query={GroupingsCollection.ID_FIELD: grouping_id}, raw_updates=updates)

    def delete_grouping(self, grouping_id: str) -> str:
        return self.delete_exactly_one(query={GroupingsCollection.ID_FIELD: grouping_id})

    def check_if_grouping_exists(self, grouping_id: str) -> bool:
        return self.check_if_exactly_one_exists(query={GroupingsCollection.ID_FIELD: grouping_id})
