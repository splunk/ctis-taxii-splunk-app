from datetime import datetime

from attrs import define, field
from cattr.gen import make_dict_structure_fn
from cattrs import Converter
from stix2 import Indicator as StixIndicator
from stix2patterns.validator import validate as stix_validate

from .tlp_v1 import TLPv1


# This Indicator Model represents fields required to generate a STIX 2.1 Indicator object
@define(slots=False, kw_only=True)
class BaseModel:
    key: str = None
    user: str = None


@define(slots=False, kw_only=True)
class BaseModelV1(BaseModel):
    schema_version: int = field(default=1)


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
        raise ValueError("Confidence must be between 0 and 100")


@define(slots=False, kw_only=True)
class IndicatorModelV1(BaseModelV1):
    indicator_id: str = field(validator=[validate_indicator_id])
    grouping_id: str = field()
    splunk_field_name: str = field()
    splunk_field_value: str = field()
    name: str = field()
    description: str = field()
    stix_pattern: str = field(validator=[validate_stix_pattern])
    tlp_v1_rating: TLPv1 = field()
    valid_from: datetime = field()
    confidence: int = field(validator=[validate_confidence])


indicator_converter = Converter()


def unstructure_datetime_hook(val: datetime) -> str:
    """This hook will be registered for `datetime`s."""
    return val.isoformat()


def structure_datetime_hook(value, type) -> datetime:
    """This hook will be registered for `datetime`s."""
    return datetime.fromisoformat(value)


def make_structure(cls):
    default_structure = make_dict_structure_fn(cls, indicator_converter)

    def custom(val, another_cls):
        key = val.get("_key")
        user = val.get("_user")
        if key is not None:
            val["key"] = key
            del val["_key"]
        if user is not None:
            val["user"] = user
            del val["_user"]
        result = default_structure(val, another_cls)
        return result

    return custom


indicator_converter.register_structure_hook_factory(lambda cls: issubclass(cls, IndicatorModelV1), make_structure)
indicator_converter.register_structure_hook(datetime, structure_datetime_hook)
indicator_converter.register_unstructure_hook(datetime, unstructure_datetime_hook)

# TODO: create unstructure hook to handle _key and _user fields
