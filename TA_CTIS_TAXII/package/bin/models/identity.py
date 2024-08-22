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


@define(slots=False, kw_only=True)
class IdentityModelV1(BaseModelV1):
    identity_id: str = field(validator=[validate_identity_id])

    @identity_id.default
    def _identity_id_default(self):
        return f"identity--{uuid4()}"

    name: str = field()
    identity_class: str = field()

    def to_stix(self) -> Identity:
        return Identity(
            id=self.identity_id,
            name=self.name,
            identity_class=self.identity_class
        )


identity_converter = make_base_converter()
