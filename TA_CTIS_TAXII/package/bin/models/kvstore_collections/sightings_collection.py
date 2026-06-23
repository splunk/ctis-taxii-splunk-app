from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..sighting import SightingModelV1, sighting_converter
from cattrs import Converter
from typing import Dict, List, Type


class SightingsCollection(AbstractKVStoreCollection[SightingModelV1]):
    SIGHTING_ID_FIELD = "sighting_id"
    SIGHTING_OF_REF_FIELD = "sighting_of_ref"

    @property
    def model_class(self) -> Type[SightingModelV1]:
        return SightingModelV1

    @property
    def model_converter(self) -> Converter:
        return sighting_converter

    @property
    def collection_name(self) -> CollectionName:
        return CollectionName.SIGHTINGS

    @property
    def primary_key(self) -> str:
        return SightingsCollection.SIGHTING_ID_FIELD

    def fetch_many_by_sighting_of_ref(self, sighting_of_ref: str) -> List[SightingModelV1]:
        return self.fetch_many_structured(query={SightingsCollection.SIGHTING_OF_REF_FIELD: sighting_of_ref})

    def get_sighting(self, sighting_id: str) -> SightingModelV1:
        return self.fetch_exactly_one_structured(query={SightingsCollection.SIGHTING_ID_FIELD: sighting_id})

    def update_sighting_structured(self, sighting_id: str, updates: Dict) -> SightingModelV1:
        return self.update_one_structured(query={SightingsCollection.SIGHTING_ID_FIELD: sighting_id}, updates=updates)

    def update_sighting_raw(self, sighting_id: str, updates: Dict) -> Dict:
        return self.update_one_raw(query={SightingsCollection.SIGHTING_ID_FIELD: sighting_id}, raw_updates=updates)

    def delete_sighting(self, sighting_id: str) -> str:
        return self.delete_exactly_one(query={SightingsCollection.SIGHTING_ID_FIELD: sighting_id})

    def check_if_sighting_exists(self, sighting_id: str) -> bool:
        return self.check_if_exactly_one_exists(query={SightingsCollection.SIGHTING_ID_FIELD: sighting_id})
