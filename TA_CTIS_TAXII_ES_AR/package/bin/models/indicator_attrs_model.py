from attrs import define, field
from stix2 import Indicator as StixIndicator

from stix2patterns.validator import validate as stix_validate


@define(slots=False, kw_only=True)
class BaseModel:
    _key: str = None
    _user: str = None


def validate_stix_pattern(pattern: str):
    _, errors = stix_validate(pattern, ret_errs=True)
    if errors:
        raise ValueError(f"Invalid STIX pattern: {errors}")


def validate_indicator_id(instance, attribute, value):
    try:
        StixIndicator(id=value, pattern_type="stix2", pattern="")
    except Exception as e:
        raise ValueError(f"Invalid indicator_id: {e}")


@define(slots=False)
class IndicatorModel(BaseModel):
    indicator_id: str = field(validator=[validate_indicator_id])
    grouping_id: str = field()
    splunk_field_name: str = field()
    splunk_field_value: str = field()
    name: str = field()
