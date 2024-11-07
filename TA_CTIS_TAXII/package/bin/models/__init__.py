from typing import List

from .indicator import IndicatorModelV1, indicator_converter, form_payload_to_indicators
from .identity import IdentityModelV1, identity_converter
from .grouping import GroupingModelV1, grouping_converter
from .submission import SubmissionModelV1, SubmissionStatus, submission_converter
from stix2 import Bundle


def bundle_for_grouping(grouping_: GroupingModelV1, grouping_identity: IdentityModelV1,
                        indicators: List[IndicatorModelV1]) -> Bundle:
    objects_to_gather_tlp_rating = indicators + [grouping_, grouping_identity]
    unique_tlp_ratings = set([ind.tlp_v2_rating for ind in objects_to_gather_tlp_rating])
    object_marking_refs = [x.to_object_marking_ref() for x in unique_tlp_ratings]

    indicators_as_stix = [ind.to_stix(created_by_ref=grouping_identity.identity_id) for ind in indicators]

    grouping_object_ids = [ind.id for ind in indicators_as_stix] + [grouping_identity.identity_id]
    grouping_stix = grouping_.to_stix(object_ids=grouping_object_ids)
    identity_stix = grouping_identity.to_stix()
    objects = [grouping_stix, identity_stix] + indicators_as_stix + object_marking_refs
    return Bundle(objects=objects)
