import json
from typing import Dict, List

from attrs import define, field
from .base import BaseModelV1, make_base_converter
from stix2 import Identity
from stix2.exceptions import InvalidValueError
import stix2
from uuid import uuid4

from .common import validate_confidence, parse_iso8601_to_naive_datetime
from .tlp_v2 import TLPv2


def validate_identity_id(instance, attribute, value):
    try:
        _ = Identity(id=value, name="name")
    except InvalidValueError as e:
        raise ValueError(f"Invalid identity_id: {e}")

"""
Example STIX identity:
{
  "type": "identity",
  "spec_version": "2.1",
  "id": "identity--e5f1b90a-d9b6-40ab-81a9-8a29df4b6b65",
  "created": "2016-04-06T20:03:00.000Z",
  "modified": "2016-04-06T20:03:00.000Z",
  "name": "ACME Widget, Inc.",
  "identity_class": "organization"
}
"""

def validate_identity_class(instance, attribute, value):
    # https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html#identity-class-vocabulary
    if value not in ["individual", "organization", "group", "class", "system", "unknown"]:
        raise ValueError(f"Invalid identity_class: {value}")

@define(slots=False, kw_only=True)
class IdentityModelV1(BaseModelV1):
    identity_id: str = field(validator=[validate_identity_id])

    @identity_id.default
    def _identity_id_default(self):
        return f"identity--{uuid4()}"

    name: str = field()
    identity_class: str = field(validator=[validate_identity_class])
    tlp_v2_rating: TLPv2 = field()
    confidence: int = field(validator=[validate_confidence], default=100)

    def to_stix(self) -> Identity:
        return Identity(
            id=self.identity_id,
            name=self.name,
            identity_class=self.identity_class,
            created=self.created,
            modified=self.modified,
            object_marking_refs=self.tlp_v2_rating.to_object_marking_ref(),
            confidence=self.confidence
        )

    @staticmethod
    def from_stix(stix_object: Dict, default_tlp_v2_rating=TLPv2.GREEN) -> 'IdentityModelV1':
        if stix_object.get('type') != 'identity':
            raise ValueError(f'Expected "type" to be "identity"')
        if stix_object.get('spec_version') != '2.1':
            raise ValueError(f'Expected "spec_version" to be "2.1"')
        if 'id' not in stix_object:
            raise ValueError(f'Expected "id" to be present')

        # Possibly need to set allow_custom=True depending on what JSON users upload
        parsed = stix2.parse(stix_object)

        confidence = stix_object.get('confidence', 100)
        object_marking_refs = stix_object.get('object_marking_refs', [])
        identity_class = stix_object.get('identity_class', 'unknown')
        created = parse_iso8601_to_naive_datetime(stix_object.get('created'))
        modified = parse_iso8601_to_naive_datetime(stix_object.get('modified'))

        tlp_rating = TLPv2.from_object_marking_refs(object_marking_refs) or default_tlp_v2_rating
        return IdentityModelV1(
            identity_id=parsed.id,
            name=parsed.name,
            confidence=confidence,
            identity_class=identity_class,
            tlp_v2_rating=tlp_rating,
            created=created,
            modified=modified,
        )


identity_converter = make_base_converter()

def validate_stix_identities(identities: List[Dict]):
    for identity in identities:
        try:
            IdentityModelV1.from_stix(stix_object=identity)
        except (ValueError, AssertionError) as e:
            raise ValueError(f"Invalid identity {json.dumps(identity)}: {e}") from e
