from __future__ import annotations

from datetime import datetime, timezone
from dateutil.parser import parse as parse_date

from attrs import define, field
from cattrs import ClassValidationError
from stix2 import Indicator as StixIndicator
import stix2
from stix2patterns.validator import validate as stix_validate
from uuid import uuid4
from .base import BaseModelV1, make_base_converter
from .common import validate_confidence
from .tlp_v2 import TLPv2
from typing import List, Optional, Tuple, Dict
from functools import reduce

"""
# This Indicator Model represents fields required to generate a STIX 2.1 Indicator object
"""


def validate_stix_pattern(instance, attribute, value: str):
    _, errors = stix_validate(value, ret_errs=True)
    if errors:
        raise ValueError(f"Invalid STIX pattern: {errors}")


def validate_indicator_id(instance, attribute, value):
    try:
        StixIndicator(id=value, pattern_type="stix", pattern="[url:value = 'abc']")
    except Exception as e:
        raise ValueError(f"Invalid indicator_id: {e}")


def validate_grouping_id(instance, attribute, value):
    if not value:
        raise ValueError("grouping_id must be provided")
    if not value.startswith("grouping--"):
        raise ValueError("grouping_id must start with 'grouping--'")

@define(slots=False, kw_only=True)
class IndicatorModelV1(BaseModelV1):
    indicator_id: str = field(validator=[validate_indicator_id])

    @indicator_id.default
    def _indicator_id_default(self):
        return f"indicator--{uuid4()}"

    grouping_id: str = field(validator=[validate_grouping_id])
    splunk_field_name: Optional[str] = field(default=None)
    indicator_value: str = field()

    # For now leave as str, but in future do we need to use the IoCCategory enum?
    indicator_category: str = field()

    name: str = field()
    description: str = field()
    stix_pattern: str = field(validator=[validate_stix_pattern])
    tlp_v2_rating: TLPv2 = field()
    valid_from: datetime = field()
    confidence: int = field(validator=[validate_confidence])

    def to_stix(self, created_by_ref:str = None) -> StixIndicator:
        return StixIndicator(
            id=self.indicator_id,
            created_by_ref=created_by_ref,
            created=self.created,
            modified=self.modified,
            name=self.name,
            description=self.description,
            pattern=self.stix_pattern,
            pattern_type="stix",
            valid_from=self.valid_from,
            confidence=self.confidence,
            object_marking_refs=self.tlp_v2_rating.to_object_marking_ref(),
        )

    @staticmethod
    def from_stix_object(stix_json: Dict, grouping_id: str) -> IndicatorModelV1:
        """
        Links to STIX spec
        https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html#indicator
        https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html#common-properties
        """
        stix2_object = stix2.parse(data=stix_json, allow_custom=True)

        assert stix2_object.pattern_type == "stix"
        assert stix2_object.pattern is not None

        # spec required properties
        created_dt = parse_date(stix_json["created"])
        modified_dt = parse_date(stix_json["modified"])
        # spec optional properties
        name = getattr(stix2_object, "name", "")
        description = getattr(stix2_object, "description", "")
        confidence = getattr(stix2_object, "confidence", 100)

        return IndicatorModelV1(indicator_id=stix2_object.id,
                                grouping_id=grouping_id,
                                created=created_dt,
                                modified=modified_dt,
                                name=name,
                                description=description,
                                stix_pattern=stix2_object.pattern,
                                confidence=confidence,
                                indicator_value='',
                                indicator_category='',
                                tlp_v2_rating=TLPv2.GREEN, # placeholder?
                                valid_from=datetime.now(tz=timezone.utc), # replace with valid_from
                                )


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

def maximum_tlpv2_of_indicators(indicators: List[IndicatorModelV1]) -> TLPv2:
    if not indicators:
        raise ValueError("Must provide non-empty list of indicators")
    return reduce(TLPv2.maximum, [ind.tlp_v2_rating for ind in indicators])
