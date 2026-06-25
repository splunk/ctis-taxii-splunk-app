from dataclasses import dataclass

from .collection_name import CollectionName
from .groupings_collection import GroupingsCollection
from .identities_collection import IdentitiesCollection
from .indicators_collection import IndicatorsCollection
from .sightings_collection import SightingsCollection
from .submissions_collection import SubmissionsCollection

from ..sighting import SightingModelV1

COLLECTION_NAME_TO_COLLECTION_CLASS = {
    CollectionName.INDICATORS: IndicatorsCollection,
    CollectionName.IDENTITIES: IdentitiesCollection,
    CollectionName.GROUPINGS: GroupingsCollection,
    CollectionName.SIGHTINGS: SightingsCollection,
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
        self.sightings = SightingsCollection(session_key=self.session_key, app_namespace=self.app_namespace)
        self.submissions = SubmissionsCollection(session_key=self.session_key, app_namespace=self.app_namespace)
        self.collections = {
            CollectionName.INDICATORS: self.indicators,
            CollectionName.IDENTITIES: self.identities,
            CollectionName.GROUPINGS: self.groupings,
            CollectionName.SIGHTINGS: self.sightings,
            CollectionName.SUBMISSIONS: self.submissions,
        }

    def validate_sighting_references(self, sighting: SightingModelV1):
        assert self.indicators.check_if_indicator_exists(indicator_id=sighting.sighting_of_ref), f"Indicator {sighting.sighting_of_ref} not found in indicators collection"

        if sighting.created_by_ref is not None:
            assert self.identities.check_if_identity_exists(identity_id=sighting.created_by_ref), f"Identity {sighting.created_by_ref} not found in identities collection"

        for identity_id in sighting.where_sighted_refs:
            assert self.identities.check_if_identity_exists(identity_id=identity_id), f"Identity {identity_id} not found in identities collection"
