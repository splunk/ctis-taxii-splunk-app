from __future__ import annotations

from datetime import datetime

from attrs import define, field
from stix2 import Sighting as StixSighting
from uuid import uuid4
from .base import BaseModelV1, make_base_converter
from .common import validate_confidence
from .tlp_v2 import TLPv2
from typing import List, Optional


def validate_created_by(instance, attribute, value):
    if value is not None:
        assert isinstance(value, str), "created_by_ref must be a string"
        if not value.startswith("identity--"):
            raise ValueError("Invalid created_by")

def validate_sighting_id(instance, attribute, value):
    try:
        StixSighting(id=value, sighting_of_ref=f"indicator--{uuid4()}")
    except Exception as e:
        raise ValueError(f"Invalid sighting_id: {e}")


def validate_sighting_of_ref(instance, attribute, value):
    if not value:
        raise ValueError("sighting_of_ref must be provided")
    if not isinstance(value, str):
        raise ValueError("sighting_of_ref must be a string")
    if not value.startswith("indicator--"):
        # The spec says that sighting_of_ref must be an ID of an SDO.
        # For the context of this app we will restrict to only indicators.
        raise ValueError("sighting_of_ref must be a valid STIX indicator identifier (e.g., 'indicator--{uuid}')")


def validate_count(instance, attribute, value: int):
    if value is not None and value < 1:
        raise ValueError("count must be >= 1")


def validate_where_sighted_refs(instance, attribute, value: List[str]):
    if value is not None:
        if not isinstance(value, list):
            raise ValueError("where_sighted_refs must be a list")
        for ref in value:
            if not isinstance(ref, str):
                raise ValueError("where_sighted_refs must contain strings")
            if not ref.startswith("identity--"):
                # STIX spec: 'A list of ID references to the Identity or Location objects describing the entities or types of entities that saw the sighting.'
                # For our app we restrict to only Identity objects
                raise ValueError(f"Invalid STIX identifier in where_sighted_refs: {ref}. Expecting an Identity ID")


"""
https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html#sighting
I've decided to only make the strictly required fields in the spec to also be required here in the model.
We can enforce soft field requirements on the front-end with JS.
Most users would not be directly using the REST endpoints anyway.

The stix2 library implementation of Sighting:
https://stix2.readthedocs.io/en/latest/api/v21/stix2.v21.sro.html#stix2.v21.sro.Sighting
"""
@define(slots=False, kw_only=True)
class SightingModelV1(BaseModelV1):
    sighting_id: str = field(validator=[validate_sighting_id])

    @sighting_id.default
    def _sighting_id_default(self):
        return f"sighting--{uuid4()}"

    sighting_of_ref: str = field(validator=[validate_sighting_of_ref])
    description: Optional[str] = field(default=None)
    first_seen: Optional[datetime] = field(default=None)
    last_seen: Optional[datetime] = field(default=None)
    count: Optional[int] = field(default=None, validator=[validate_count])
    where_sighted_refs: Optional[List[str]] = field(factory=list, validator=[validate_where_sighted_refs])
    created_by_ref: Optional[str] = field(default=None, validator=[validate_created_by])  # An Identity ID
    summary: bool = field(default=False)
    tlp_v2_rating: Optional[TLPv2] = field(default=None)
    confidence: int = field(validator=[validate_confidence], default=100)

    def __attrs_post_init__(self):
        super().__attrs_post_init__()
        if self.first_seen is not None and self.last_seen is not None:
            if self.first_seen > self.last_seen:
                raise ValueError("first_seen must be <= last_seen")

    def to_stix(self) -> StixSighting:
        kwargs = {
            "id": self.sighting_id,
            "sighting_of_ref": self.sighting_of_ref,
            "created": self.created,
            "modified": self.modified,
            "confidence": self.confidence,
            "object_marking_refs": self.tlp_v2_rating.to_object_marking_ref(),
            "summary": self.summary,
        }

        if self.created_by_ref:
            kwargs["created_by_ref"] = self.created_by_ref

        if self.description:
            kwargs["description"] = self.description

        if self.first_seen is not None:
            kwargs["first_seen"] = self.first_seen

        if self.last_seen is not None:
            kwargs["last_seen"] = self.last_seen

        if self.count is not None:
            kwargs["count"] = self.count

        if self.where_sighted_refs:
            kwargs["where_sighted_refs"] = self.where_sighted_refs

        return StixSighting(**kwargs)


sighting_converter = make_base_converter()
