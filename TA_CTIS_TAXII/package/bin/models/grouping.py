from datetime import datetime
from uuid import uuid4

from attrs import define, field
from stix2 import Grouping
from typing import List, Optional

from .base import BaseModelV1, make_base_converter
from .tlp_v2 import TLPv2


def validate_grouping_id(instance, attribute, value):
    try:
        Grouping(id=value, context="unspecified", object_refs=[f"indicator--{uuid4()}"])
    except Exception as e:
        raise ValueError(f"Invalid grouping id: {e}")


def validate_created_by(instance, attribute, value):
    if not value.startswith("identity--"):
        raise ValueError("Invalid created_by")


def validate_grouping_context(instance, attribute, value):
    # https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_6g420oc42vbo
    if value not in ["suspicious-activity", "malicious-activity", "unspecified"]:
        raise ValueError("Invalid context")


"""
Sample STIX grouping: https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_6w1q1wewd5t4
{
  "type": "grouping",
  "spec_version": "2.1",
  "id": "grouping--84e4d88f-44ea-4bcd-bbf3-b2c1c320bcb3",
  "created_by_ref": "identity--a463ffb3-1bd9-4d94-b02d-74e4f1658283",
  "created": "2015-12-21T19:59:11.000Z",
  "modified": "2015-12-21T19:59:11.000Z",
  "name": "The Black Vine Cyberespionage Group",
  "description": "A simple collection of Black Vine Cyberespionage Group attributed intel",
  "context": "suspicious-activity",
  "object_refs": [
    "indicator--26ffb872-1dd9-446e-b6f5-d58527e5b5d2",
    "campaign--83422c77-904c-4dc1-aff5-5c38f3a2c55c",
    "relationship--f82356ae-fe6c-437c-9c24-6b64314ae68a",
    "file--0203b5c8-f8b6-4ddb-9ad0-527d727f968b"
  ]
}
"""


@define(slots=False, kw_only=True)
class GroupingModelV1(BaseModelV1):
    grouping_id: str = field(validator=[validate_grouping_id])

    @grouping_id.default
    def _grouping_id_default(self):
        return f"grouping--{uuid4()}"

    # REST handler should validate that this identity exists in DB
    created_by_ref: str = field(validator=[validate_created_by])  # An Identity ID
    context: str = field(validator=[validate_grouping_context])
    name: str = field()
    description: str = field()
    last_submission_at: Optional[datetime] = field(default=None)
    tlp_v2_rating: TLPv2 = field()

    def to_stix(self, object_ids: List) -> Grouping:
        assert len(object_ids) > 0, "Grouping must have at least one object_ref such as an Indicator ID."
        object_refs = object_ids
        # Note that created_by_ref refers to the Identity id that created this Grouping
        # whereas object_refs refers to the subject objects of this Grouping.
        # If the identity itself is directly related to the subject of the grouping (e.g., the threat actor identity)
        # then the identity id should be included in the object_refs.
        grouping = Grouping(id=self.grouping_id, created_by_ref=self.created_by_ref, context=self.context,
                            name=self.name,
                            description=self.description,
                            object_refs=object_refs,
                            object_marking_refs=self.tlp_v2_rating.to_object_marking_ref(),
                            created=self.created,
                            modified=self.modified)
        return grouping


grouping_converter = make_base_converter()
