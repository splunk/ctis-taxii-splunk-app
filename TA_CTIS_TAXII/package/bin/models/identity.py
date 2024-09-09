from attrs import define, field
from .base import BaseModelV1, make_base_converter
from stix2 import Identity
from stix2.exceptions import InvalidValueError
from uuid import uuid4


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
    if value not in ["individual", "organization", "group", "class", "unknown"]:
        raise ValueError(f"Invalid identity_class: {value}")

@define(slots=False, kw_only=True)
class IdentityModelV1(BaseModelV1):
    identity_id: str = field(validator=[validate_identity_id])

    @identity_id.default
    def _identity_id_default(self):
        return f"identity--{uuid4()}"

    name: str = field()
    identity_class: str = field(validator=[validate_identity_class])

    def to_stix(self) -> Identity:
        return Identity(
            id=self.identity_id,
            name=self.name,
            identity_class=self.identity_class,
            created=self.created,
            modified=self.modified,
        )


identity_converter = make_base_converter()
