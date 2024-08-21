from datetime import datetime

from attrs import define, field
from stix2 import Indicator as StixIndicator
from stix2patterns.validator import validate as stix_validate
from uuid import uuid4
from .base import BaseModelV1, make_base_converter
from .tlp_v1 import TLPv1

"""
# This Indicator Model represents fields required to generate a STIX 2.1 Indicator object
"""


def validate_stix_pattern(instance, attribute, value: str):
    _, errors = stix_validate(value, ret_errs=True)
    if errors:
        raise ValueError(f"Invalid STIX pattern: {errors}")


def validate_indicator_id(instance, attribute, value):
    try:
        StixIndicator(id=value, pattern_type="stix2", pattern="")
    except Exception as e:
        raise ValueError(f"Invalid indicator_id: {e}")


def validate_confidence(instance, attribute, value: int):
    if not 0 <= value <= 100:
        raise ValueError("confidence must be between 0 and 100")


@define(slots=False, kw_only=True)
class IndicatorModelV1(BaseModelV1):
    indicator_id: str = field(validator=[validate_indicator_id])
    @indicator_id.default
    def _indicator_id_default(self):
        return f"indicator--{uuid4()}"

    grouping_id: str = field()
    splunk_field_name: str = field()
    splunk_field_value: str = field()
    name: str = field()
    description: str = field()
    stix_pattern: str = field(validator=[validate_stix_pattern])
    tlp_v1_rating: TLPv1 = field()
    valid_from: datetime = field()
    confidence: int = field(validator=[validate_confidence])


indicator_converter = make_base_converter()


# TODO: These could probably be moved to base model class?
def unstructure_datetime_hook(val: datetime) -> str:
    """This hook will be registered for `datetime`s."""
    return val.isoformat()


def structure_datetime_hook(value, type) -> datetime:
    """This hook will be registered for `datetime`s."""
    return datetime.fromisoformat(value)


indicator_converter.register_structure_hook(datetime, structure_datetime_hook)
indicator_converter.register_unstructure_hook(datetime, unstructure_datetime_hook)
