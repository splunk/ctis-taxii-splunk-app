from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..grouping import GroupingModelV1, grouping_converter
from cattrs import Converter
from typing import Type

class GroupingsCollection(AbstractKVStoreCollection[GroupingModelV1]):
    @property
    def model_class(self) -> Type[GroupingModelV1]:
        return GroupingModelV1

    @property
    def model_converter(self) -> Converter:
        return grouping_converter

    @property
    def collection_name(self) -> CollectionName:
        return CollectionName.GROUPINGS
