from dataclasses import dataclass
import logging

from .collection_name import CollectionName
from .indicators_collection import IndicatorsCollection
from .identities_collection import IdentitiesCollection
from .groupings_collection import GroupingsCollection
from .submissions_collection import SubmissionsCollection

COLLECTION_NAME_TO_COLLECTION_CLASS = {
    CollectionName.INDICATORS: IndicatorsCollection,
    CollectionName.IDENTITIES: IdentitiesCollection,
    CollectionName.GROUPINGS: GroupingsCollection,
    CollectionName.SUBMISSIONS: SubmissionsCollection,
}

@dataclass
class KVStoreCollectionsContext:
    session_key: str
    logger: logging.Logger
    app_namespace: str

    def __post_init__(self):
        self.groupings = GroupingsCollection(logger=self.logger, session_key=self.session_key, app_namespace=self.app_namespace)
        self.identities = IdentitiesCollection(logger=self.logger, session_key=self.session_key, app_namespace=self.app_namespace)
        self.indicators = IndicatorsCollection(logger=self.logger, session_key=self.session_key, app_namespace=self.app_namespace)
        self.submissions = SubmissionsCollection(logger=self.logger, session_key=self.session_key, app_namespace=self.app_namespace)
        self.collections = {
            CollectionName.INDICATORS: self.indicators,
            CollectionName.IDENTITIES: self.identities,
            CollectionName.GROUPINGS: self.groupings,
            CollectionName.SUBMISSIONS: self.submissions,
        }