from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..indicator import IndicatorModelV1, indicator_converter
from cattrs import Converter
from typing import Dict, List, Type

class IndicatorsCollection(AbstractKVStoreCollection[IndicatorModelV1]):
    INDICATOR_ID_FIELD = "indicator_id"

    @property
    def model_class(self) -> Type[IndicatorModelV1]:
        return IndicatorModelV1

    @property
    def model_converter(self) -> Converter:
        return indicator_converter

    @property
    def collection_name(self) -> CollectionName:
        return CollectionName.INDICATORS

    def fetch_many_by_grouping_id(self, grouping_id: str) -> List[IndicatorModelV1]:
        return self.fetch_many_structured(query={"grouping_id": grouping_id})

    def get_indicator(self, indicator_id: str) -> IndicatorModelV1:
        return self.fetch_exactly_one_structured(query={IndicatorsCollection.INDICATOR_ID_FIELD: indicator_id})

    def update_indicator(self, indicator_id: str, updates: Dict) -> IndicatorModelV1:
        return self.update_one_structured(query={IndicatorsCollection.INDICATOR_ID_FIELD: indicator_id}, updates=updates)

    def delete_indicator(self, indicator_id: str) -> str:
        return self.delete_exactly_one(query={IndicatorsCollection.INDICATOR_ID_FIELD: indicator_id})
