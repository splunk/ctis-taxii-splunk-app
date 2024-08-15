from dataclasses import dataclass, field
from datetime import datetime

from dataclasses_json import config, dataclass_json
from marshmallow import fields, validate, ValidationError
from stix2patterns.validator import validate as stix_validate
from stix2 import Indicator as StixIndicator
from .base import BaseModel
from .tlp_v1 import TLPv1

def validate_stix_pattern(pattern:str):
    _, errors = stix_validate(pattern, ret_errs=True)
    if errors:
        raise ValidationError(f"Invalid STIX pattern: {errors}")

def validate_indicator_id(indicator_id: str):
    try:
        StixIndicator(id=indicator_id, pattern_type="stix2", pattern="")
    except Exception as e:
        raise ValidationError(f"Invalid indicator_id: {e}")

@dataclass_json
@dataclass
class Indicator(BaseModel):
    indicator_id: str = field(
        metadata=config(
            mm_field=fields.String(validate=validate_indicator_id)
        )
    )
    grouping_id: str
    splunk_field_name: str
    splunk_field_value: str
    name: str
    description: str

    stix_pattern: str = field(
        metadata=config(
            mm_field=fields.String(validate=validate_stix_pattern)
        )
    )

    confidence: int = field(
        metadata=config(
            mm_field=fields.Integer(validate=validate.Range(min=0, max=100))
        )
    )

    tlp_v1_rating: TLPv1

    valid_from: datetime = field(
        metadata=config(
            encoder=datetime.isoformat,
            decoder=datetime.fromisoformat,
            mm_field=fields.DateTime(format='iso')
        )
    )
