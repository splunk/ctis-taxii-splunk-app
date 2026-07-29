import json
import logging
from enum import Enum, unique
from typing import Dict, List

from common import AbstractRestHandler
from models import IndicatorModelV1, GroupingModelV1, grouping_converter, indicator_converter

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@unique
class Action(str, Enum):
    VALIDATE = "validate"
    IMPORT = "import"

# TODO move to models code
def validate_indicators(indicators: List[Dict]):
    dummy_grouping_id = "grouping--1c7550ed-0e27-4c3e-b91d-0a080410ca9e"
    for indicator in indicators:
        try:
            IndicatorModelV1.from_stix_object(stix_json=indicator, grouping_id=dummy_grouping_id)
        except (ValueError, AssertionError) as e:
            raise ValueError(f"Invalid indicator {json.dumps(indicator)}: {e}") from e


class ImportStixHandler(AbstractRestHandler):
    # TODO Move to collection class
    def existing_indicator_ids(self, indicators: List[Dict]):
        if len(indicators) == 0:
            return []
        indicator_ids = [x.get("id") for x in indicators]
        existing_indicators = self.kvstore_collections_context.indicators.fetch_many_structured_by_primary_key(possible_values_of_primary_key=indicator_ids)
        return [x.indicator_id for x in existing_indicators]

    def handle_validate_indicators(self, indicators: List[Dict]) -> Dict:
        validate_indicators(indicators=indicators)
        existing_ids = self.existing_indicator_ids(indicators)
        return {"existing_ids": existing_ids}

    def handle_import_indicators(self, indicators: List[Dict], new_grouping: GroupingModelV1, overwrite_existing: bool = False) -> Dict:
        validate_indicators(indicators=indicators)
        existing_ids = self.existing_indicator_ids(indicators)
        if not overwrite_existing and len(existing_ids) > 0:
            raise ValueError(f"Cannot import indicators, some already exist: {existing_ids}")

        new_grouping_unstructured = self.kvstore_collections_context.groupings.insert_record(record=new_grouping)

        # Delete existing
        if len(existing_ids) > 0:
            self.kvstore_collections_context.indicators.delete_many_by_primary_key(primary_key_values=existing_ids)

        new_indicators_structured = [IndicatorModelV1.from_stix_object(stix_json=x, grouping_id=new_grouping.grouping_id) for x in indicators]
        self.kvstore_collections_context.indicators.insert_many_structured(records=new_indicators_structured)

        return {
            "new_grouping": new_grouping_unstructured,
            "indicators": [indicator_converter.unstructure(x) for x in new_indicators_structured],
        }

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
            if action_enum == Action.IMPORT:
                if 'new_grouping' not in input_json:
                    raise ValueError("Missing 'new_grouping' field in json body")
                new_grouping = grouping_converter.structure(input_json['new_grouping'], GroupingModelV1)
                return self.handle_import_indicators(indicators=stix_objects, new_grouping=new_grouping, overwrite_existing=overwrite_existing)
            else:
                return self.handle_validate_indicators(indicators=stix_objects)
        else:
            return {
                "response" : "TODO"
            }
