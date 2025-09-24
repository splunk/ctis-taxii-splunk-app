from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..identity import IdentityModelV1, identity_converter
from cattrs import Converter
from typing import Type

class IdentitiesCollection(AbstractKVStoreCollection[IdentityModelV1]):
    @property
    def model_class(self) -> Type[IdentityModelV1]:
        return IdentityModelV1

    @property
    def model_converter(self) -> Converter:
        return identity_converter

    @property
    def collection_name(self) -> CollectionName:
        return CollectionName.IDENTITIES
