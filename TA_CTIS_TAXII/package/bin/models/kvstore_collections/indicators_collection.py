from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..indicator import IndicatorModelV1, indicator_converter
from cattrs import Converter
from typing import Dict, List, Type
from datetime import datetime, timezone

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

    @property
    def primary_key(self) -> str:
        return IndicatorsCollection.INDICATOR_ID_FIELD

    def fetch_many_by_grouping_id(self, grouping_id: str) -> List[IndicatorModelV1]:
        return self.fetch_many_structured(query={"grouping_id": grouping_id})

    # TODO integration test coverage
    def fetch_expired_or_revoked(self) -> List[IndicatorModelV1]:
        dt_utc = datetime.now(tz=timezone.utc)
        dt_naive = dt_utc.replace(tzinfo=None)
        timestamp_str = datetime.isoformat(dt_naive)
        query = self.query_or([
            {"revoked" : True},
            {"valid_until": {"$lt": timestamp_str}}
        ])
        return self.fetch_many_structured(query=query)

    def get_indicator(self, indicator_id: str) -> IndicatorModelV1:
        return self.fetch_exactly_one_structured(query={IndicatorsCollection.INDICATOR_ID_FIELD: indicator_id})

    def update_indicator_structured(self, indicator_id: str, updates: Dict) -> IndicatorModelV1:
        return self.update_one_structured(query={IndicatorsCollection.INDICATOR_ID_FIELD: indicator_id}, updates=updates)

    def update_indicator_raw(self, indicator_id: str, updates: Dict) -> Dict:
        return self.update_one_raw(query={IndicatorsCollection.INDICATOR_ID_FIELD: indicator_id}, raw_updates=updates)

    def delete_indicator(self, indicator_id: str) -> str:
        return self.delete_exactly_one(query={IndicatorsCollection.INDICATOR_ID_FIELD: indicator_id})

    def check_if_indicator_exists(self, indicator_id: str) -> bool:
        return self.check_if_exactly_one_exists(query={IndicatorsCollection.INDICATOR_ID_FIELD: indicator_id})
