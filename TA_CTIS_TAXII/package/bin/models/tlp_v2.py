from enum import Enum
import stix2
from stix2 import MarkingDefinition

# TLP 2.0 definitions from:
# https://github.com/oasis-open/cti-stix-common-objects/tree/main/extension-definition-specifications/tlp-2.0/examples

AMBER_STRICT_MARKING_DEFINITION = stix2.parse({
    "type": "marking-definition",
    "spec_version": "2.1",
    "id": "marking-definition--939a9414-2ddd-4d32-a0cd-375ea402b003",
    "created": "2022-10-01T00:00:00.000Z",
    "name": "TLP:AMBER+STRICT",
    "extensions": {
        "extension-definition--60a3c5c5-0d10-413e-aab3-9e08dde9e88d": {
            "extension_type": "property-extension",
            "tlp_2_0": "amber+strict"
        }
    }
})

AMBER_MARKING_DEFINITION = stix2.parse({
    "type": "marking-definition",
    "spec_version": "2.1",
    "id": "marking-definition--55d920b0-5e8b-4f79-9ee9-91f868d9b421",
    "created": "2022-10-01T00:00:00.000Z",
    "name": "TLP:AMBER",
    "extensions": {
        "extension-definition--60a3c5c5-0d10-413e-aab3-9e08dde9e88d": {
            "extension_type": "property-extension",
            "tlp_2_0": "amber"
        }
    }
})

CLEAR_MARKING_DEFINITION = stix2.parse({
    "type": "marking-definition",
    "spec_version": "2.1",
    "id": "marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487",
    "created": "2022-10-01T00:00:00.000Z",
    "name": "TLP:CLEAR",
    "extensions": {
        "extension-definition--60a3c5c5-0d10-413e-aab3-9e08dde9e88d": {
            "extension_type": "property-extension",
            "tlp_2_0": "clear"
        }
    }
})
GREEN_MARKING_DEFINITION = stix2.parse({
    "type": "marking-definition",
    "spec_version": "2.1",
    "id": "marking-definition--bab4a63c-aed9-4cf5-a766-dfca5abac2bb",
    "created": "2022-10-01T00:00:00.000Z",
    "name": "TLP:GREEN",
    "extensions": {
        "extension-definition--60a3c5c5-0d10-413e-aab3-9e08dde9e88d": {
            "extension_type": "property-extension",
            "tlp_2_0": "green"
        }
    }
})

RED_MARKING_DEFINITION = stix2.parse({
    "type": "marking-definition",
    "spec_version": "2.1",
    "id": "marking-definition--e828b379-4e03-4974-9ac4-e53a884c97c1",
    "created": "2022-10-01T00:00:00.000Z",
    "name": "TLP:RED",
    "extensions": {
        "extension-definition--60a3c5c5-0d10-413e-aab3-9e08dde9e88d": {
            "extension_type": "property-extension",
            "tlp_2_0": "red"
        }
    }
})


class TLPv2(Enum):
    CLEAR = "CLEAR"
    AMBER_STRICT = "AMBER+STRICT"
    AMBER = "AMBER"
    GREEN = "GREEN"
    RED = "RED"

    def to_object_marking_ref(self) -> MarkingDefinition:
        if self == TLPv2.CLEAR:
            return CLEAR_MARKING_DEFINITION
        elif self == TLPv2.AMBER_STRICT:
            return AMBER_STRICT_MARKING_DEFINITION
        elif self == TLPv2.AMBER:
            return AMBER_MARKING_DEFINITION
        elif self == TLPv2.GREEN:
            return GREEN_MARKING_DEFINITION
        elif self == TLPv2.RED:
            return RED_MARKING_DEFINITION
        else:
            raise ValueError(f"Invalid TLPv2 value: {self}")
