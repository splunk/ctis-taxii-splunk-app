from dataclasses import dataclass

from .collection_name import CollectionName
from .groupings_collection import GroupingsCollection
from .identities_collection import IdentitiesCollection
from .indicators_collection import IndicatorsCollection
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
    app_namespace: str

    def __post_init__(self):
        self.groupings = GroupingsCollection(session_key=self.session_key, app_namespace=self.app_namespace)
        self.identities = IdentitiesCollection(session_key=self.session_key, app_namespace=self.app_namespace)
        self.indicators = IndicatorsCollection(session_key=self.session_key, app_namespace=self.app_namespace)
        self.submissions = SubmissionsCollection(session_key=self.session_key, app_namespace=self.app_namespace)
        self.collections = {
            CollectionName.INDICATORS: self.indicators,
            CollectionName.IDENTITIES: self.identities,
            CollectionName.GROUPINGS: self.groupings,
            CollectionName.SUBMISSIONS: self.submissions,
        }