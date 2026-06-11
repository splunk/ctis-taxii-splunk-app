from .collection_name import CollectionName
from .abstract_collection import AbstractKVStoreCollection
from ..submission import SubmissionModelV1, submission_converter
from cattrs import Converter
from typing import Type, Dict

class SubmissionsCollection(AbstractKVStoreCollection[SubmissionModelV1]):
    SUBMISSION_ID_FIELD = "submission_id"
    @property
    def model_class(self) -> Type[SubmissionModelV1]:
        return SubmissionModelV1

    @property
    def model_converter(self) -> Converter:
        return submission_converter

    @property
    def collection_name(self) -> CollectionName:
        return CollectionName.SUBMISSIONS

    @property
    def primary_key(self) -> str:
        return SubmissionsCollection.SUBMISSION_ID_FIELD

    def get_submission(self, submission_id: str) -> SubmissionModelV1:
        return self.fetch_exactly_one_structured(query={SubmissionsCollection.SUBMISSION_ID_FIELD: submission_id})

    def update_submission(self, submission_id: str, updates: Dict) -> SubmissionModelV1:
        """
        Update a submission by its ID with the provided update_data which is a dict of key-values.
        """
        return self.update_one_structured(query={SubmissionsCollection.SUBMISSION_ID_FIELD: submission_id}, updates=updates)

