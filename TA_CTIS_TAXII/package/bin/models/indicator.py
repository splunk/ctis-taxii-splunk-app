from datetime import datetime

from attrs import define, field
from cattrs import ClassValidationError
from stix2 import Indicator as StixIndicator
from stix2patterns.validator import validate as stix_validate
from uuid import uuid4
from .base import BaseModelV1, make_base_converter
from .tlp_v1 import TLPv1
from typing import List, Optional, Tuple

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
    splunk_field_name: Optional[str] = field(default=None)
    indicator_value: str = field()

    # For now leave as str, but in future do we need to use the IoCCategory enum?
    indicator_category: str = field()

    name: str = field()
    description: str = field()
    stix_pattern: str = field(validator=[validate_stix_pattern])
    tlp_v1_rating: TLPv1 = field()
    valid_from: datetime = field()
    confidence: int = field(validator=[validate_confidence])

"""
Example form payload:
{
    "grouping_id": "A",
    "confidence": 100,
    "tlp_v1_rating": "GREEN",
    "valid_from": "2024-09-03T22:51:44.361",
    "indicators": [
        {
            "splunk_field_name": "",
            "indicator_value": "123.456.1.2",
            "indicator_category": "source_ipv4",
            "stix_pattern": "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '123.456.1.2']",
            "name": "asdf",
            "description": "adsf"
        }
    ]
}
"""


indicator_converter = make_base_converter()

def form_payload_to_indicators(form_payload: dict) -> Tuple[list, List[IndicatorModelV1]]:
    indicators = form_payload["indicators"]
    common_fields = form_payload.copy()
    del common_fields["indicators"]
    indicator_models = []
    errors = []
    for index, indicator_dict in enumerate(indicators):
        try:
            indicator_dict = {**indicator_dict, **common_fields}
            indicator_model = indicator_converter.structure(indicator_dict, IndicatorModelV1)
            indicator_models.append(indicator_model)
        except ClassValidationError as e:
            errors.append({"index": index, "errors": [str(x) for x in e.exceptions]})
    return errors, indicator_models
