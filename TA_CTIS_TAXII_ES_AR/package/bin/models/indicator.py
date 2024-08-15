from dataclasses import dataclass, field
from datetime import datetime

from dataclasses_json import config, dataclass_json
from marshmallow import fields, validate

from .base import BaseModel
from .tlp_v1 import TLPv1


@dataclass_json
@dataclass
class Indicator(BaseModel):
    indicator_id: str
    grouping_id: str
    splunk_field_name: str
    splunk_field_value: str
    name: str
    description: str

    # TODO: Add validation for STIX pattern??
    stix_pattern: str

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
