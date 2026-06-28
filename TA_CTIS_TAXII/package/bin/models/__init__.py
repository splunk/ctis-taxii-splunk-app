from typing import List, Optional

import pytz

from .indicator import IndicatorModelV1, indicator_converter, form_payload_to_indicators, maximum_tlpv2_of_indicators
from .identity import IdentityModelV1, identity_converter
from .grouping import GroupingModelV1, grouping_converter
from .sighting import SightingModelV1, sighting_converter
from .submission import SubmissionModelV1, SubmissionStatus, submission_converter
from .base import BaseModelV1
from .tlp_v2 import TLPv2
from .kvstore_collections import KVStoreCollectionsContext, CollectionName

from stix2 import Bundle
from stix2.v21.base import _STIXBase21
import stix2.utils
import stix2.serialization


def custom_format_datetime(datetime_obj) -> str:
    """Custom datetime formatting function to override the behaviour of stix2.utils.format_datetime.
    CTIS team has requested that all timestamps have exactly 6 decimal places for fractional seconds.
    Examples:
     - 2025-07-08T03:30:10.123456Z
     - 2025-07-08T03:30:10.000000Z
    """
    zoned = datetime_obj.astimezone(pytz.utc)
    timestamp = zoned.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    return timestamp

def serialize_stix_object(stix_object: _STIXBase21, **kwargs) -> str:
    old_utils_format_datetime = stix2.utils.format_datetime
    old_serialization_format_datetime = stix2.serialization.format_datetime

    # Patch format_datetime to use the custom format function
    stix2.utils.format_datetime = custom_format_datetime
    stix2.serialization.format_datetime = custom_format_datetime

    serialized = stix_object.serialize(**kwargs)

    # Restore the original format_datetime functions
    stix2.utils.format_datetime = old_utils_format_datetime
    stix2.serialization.format_datetime = old_serialization_format_datetime

    return serialized

def bundle_for_grouping(grouping_: GroupingModelV1, identities: List[IdentityModelV1],
                        indicators: List[IndicatorModelV1], sightings: Optional[List[SightingModelV1]]=None) -> Bundle:
    if sightings is None:
        sightings = []
    objects_to_gather_tlp_rating = indicators + sightings + identities + [grouping_]
    unique_tlp_ratings = set([obj.tlp_v2_rating for obj in objects_to_gather_tlp_rating if obj.tlp_v2_rating is not None])
    object_marking_refs = [x.to_object_marking_ref() for x in unique_tlp_ratings]

    indicators_as_stix = [ind.to_stix(created_by_ref=grouping_.created_by_ref) for ind in indicators]

    grouping_object_ids = [ind.id for ind in indicators_as_stix] + [grouping_.created_by_ref]
    grouping_stix = grouping_.to_stix(object_ids=grouping_object_ids)

    identities_as_stix = [_identity.to_stix() for _identity in identities]
    sightings_as_stix = [s.to_stix() for s in sightings]
    objects = [grouping_stix] + identities_as_stix + indicators_as_stix + sightings_as_stix + object_marking_refs
    return Bundle(objects=objects)
