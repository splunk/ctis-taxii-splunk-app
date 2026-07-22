import logging
from typing import Dict, List
import json

from models import IndicatorModelV1
from common import AbstractRestHandler
from enum import Enum, unique

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@unique
class Action(str, Enum):
    VALIDATE = "validate"
    IMPORT = "import"

def validate_indicators(indicators: List[Dict]):
    dummy_grouping_id = "grouping--1c7550ed-0e27-4c3e-b91d-0a080410ca9e"
    for indicator in indicators:
        try:
            IndicatorModelV1.from_stix_object(stix_json=indicator, grouping_id=dummy_grouping_id)
        except (ValueError, AssertionError) as e:
            raise ValueError(f"Invalid indicator {json.dumps(indicator)}: {e}") from e


class ImportStixHandler(AbstractRestHandler):
    def existing_indicator_ids(self, indicators: List[Dict]):
        if len(indicators) == 0:
            return []
        indicator_ids = [x.get("id") for x in indicators]
        existing_indicators = self.kvstore_collections_context.indicators.fetch_many_structured_by_primary_key(possible_values_of_primary_key=indicator_ids)
        return [x.indicator_id for x in existing_indicators]

    def handle_for_indicators(self, action : Action, indicators: List[Dict], overwrite_existing: bool = False) -> Dict:
        validate_indicators(indicators=indicators)
        indicator_ids = self.existing_indicator_ids(indicators)
        if action == Action.IMPORT:
            pass # handle persistence
            return {}
        else:
            return {"existing_ids": indicator_ids}

    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if 'action' not in input_json:
            raise ValueError("Missing 'action' field in json body")
        action = input_json['action']
        try:
            action_enum = Action(input_json['action'])
        except ValueError as e:
            raise ValueError(f"Invalid action type given: {action}") from e

        if 'model_type' not in input_json:
            raise ValueError("Missing 'model_type' field in json body")
        model_type = input_json['model_type']
        if model_type not in ['indicator', 'identity']:
            raise ValueError(f"Invalid model_type given: {model_type}")

        stix_objects = input_json.get('stix_objects', [])
        if not isinstance(stix_objects, list) or len(stix_objects) == 0:
            raise ValueError(f"Expected stix_objects to be a non-empty array")

        overwrite_existing = input_json.get('overwrite_existing', False)
        logger.info(f"action={action}, overwrite_existing={overwrite_existing}")
        if model_type=='indicator':
            return self.handle_for_indicators(action=action_enum, indicators=stix_objects, overwrite_existing=overwrite_existing)
        else:
            return {
                "response" : "TODO"
            }
