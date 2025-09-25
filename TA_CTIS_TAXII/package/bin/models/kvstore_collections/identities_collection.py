from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..identity import IdentityModelV1, identity_converter
from cattrs import Converter
from typing import Dict, Type

class IdentitiesCollection(AbstractKVStoreCollection[IdentityModelV1]):
    IDENTITY_ID_FIELD = "identity_id"
    @property
    def model_class(self) -> Type[IdentityModelV1]:
        return IdentityModelV1

    @property
    def model_converter(self) -> Converter:
        return identity_converter

    @property
    def collection_name(self) -> CollectionName:
        return CollectionName.IDENTITIES

    def get_identity(self, identity_id: str) -> IdentityModelV1:
        return self.fetch_exactly_one_structured(query={IdentitiesCollection.IDENTITY_ID_FIELD: identity_id})

    def update_identity(self, identity_id: str, updates: Dict) -> IdentityModelV1:
        return self.update_one_structured(query={IdentitiesCollection.IDENTITY_ID_FIELD: identity_id}, updates=updates)

    def delete_identity(self, identity_id: str) -> str:
        return self.delete_exactly_one(query={IdentitiesCollection.IDENTITY_ID_FIELD: identity_id})

    def check_if_identity_exists(self, identity_id: str) -> bool:
        return self.check_if_exactly_one_exists(query={IdentitiesCollection.IDENTITY_ID_FIELD: identity_id})
