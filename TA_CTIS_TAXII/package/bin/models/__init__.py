from typing import List

import pytz

from .indicator import IndicatorModelV1, indicator_converter, form_payload_to_indicators
from .identity import IdentityModelV1, identity_converter
from .grouping import GroupingModelV1, grouping_converter
from .submission import SubmissionModelV1, SubmissionStatus, submission_converter
from .tlp_v2 import TLPv2

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

def bundle_for_grouping(grouping_: GroupingModelV1, grouping_identity: IdentityModelV1,
                        indicators: List[IndicatorModelV1]) -> Bundle:
    objects_to_gather_tlp_rating = indicators + [grouping_, grouping_identity]
    unique_tlp_ratings = set([obj.tlp_v2_rating for obj in objects_to_gather_tlp_rating])
    object_marking_refs = [x.to_object_marking_ref() for x in unique_tlp_ratings]

    indicators_as_stix = [ind.to_stix(created_by_ref=grouping_identity.identity_id) for ind in indicators]

    grouping_object_ids = [ind.id for ind in indicators_as_stix] + [grouping_identity.identity_id]
    grouping_stix = grouping_.to_stix(object_ids=grouping_object_ids)
    identity_stix = grouping_identity.to_stix()
    objects = [grouping_stix, identity_stix] + indicators_as_stix + object_marking_refs
    return Bundle(objects=objects)
