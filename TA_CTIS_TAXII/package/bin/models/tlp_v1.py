from enum import Enum
from stix2 import MarkingDefinition, TLP_WHITE, TLP_GREEN, TLP_AMBER, TLP_RED

class TLPv1(Enum):
    WHITE = "WHITE"
    GREEN = "GREEN"
    AMBER = "AMBER"
    RED = "RED"

    def to_object_marking_ref(self) -> MarkingDefinition:
        if self == TLPv1.WHITE:
            return TLP_WHITE
        elif self == TLPv1.GREEN:
            return TLP_GREEN
        elif self == TLPv1.AMBER:
            return TLP_AMBER
        elif self == TLPv1.RED:
            return TLP_RED
