from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..submission import SubmissionModelV1, submission_converter
from cattrs import Converter
from typing import Type

class SubmissionsCollection(AbstractKVStoreCollection[SubmissionModelV1]):
    @property
    def model_class(self) -> Type[SubmissionModelV1]:
        return SubmissionModelV1

    @property
    def model_converter(self) -> Converter:
        return submission_converter

    @property
    def collection_name(self) -> CollectionName:
        return CollectionName.SUBMISSIONS

