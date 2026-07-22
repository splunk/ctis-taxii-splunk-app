import json
import logging
from enum import Enum, unique
from typing import Dict, List

from common import AbstractRestHandler
from models import IndicatorModelV1, GroupingModelV1, grouping_converter, indicator_converter
from remote_pdb import RemotePdb
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

    def handle_validate_indicators(self, indicators: List[Dict]) -> Dict:
        validate_indicators(indicators=indicators)
        existing_ids = self.existing_indicator_ids(indicators)
        return {"existing_ids": existing_ids}

    def handle_import_indicators(self, indicators: List[Dict], new_grouping: GroupingModelV1, overwrite_existing: bool = False) -> Dict:
        validate_indicators(indicators=indicators)
        existing_ids = set(self.existing_indicator_ids(indicators))
        if not overwrite_existing and len(existing_ids) > 0:
            raise ValueError(f"Cannot import indicators, some already exist: {existing_ids}")

        new_grouping_unstructured = self.kvstore_collections_context.groupings.insert_record(record=new_grouping)

        new_indicators = []
        # This might be too slow for 1000+ indicators, perhaps replace with a bulk delete + insert operation?
        for indicator_dict in indicators:
            indicator_model = IndicatorModelV1.from_stix_object(stix_json=indicator_dict, grouping_id=new_grouping.grouping_id)

            if overwrite_existing and indicator_model.indicator_id in existing_ids:
                self.kvstore_collections_context.indicators.delete_indicator(indicator_id=indicator_model.indicator_id)
            unstructured_indicator = self.kvstore_collections_context.indicators.insert_record(record=indicator_model)
            new_indicators.append(unstructured_indicator)
        return {
            "new_grouping": new_grouping_unstructured,
            "indicators": new_indicators,
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
