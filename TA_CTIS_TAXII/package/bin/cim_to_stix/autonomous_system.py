from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter
from .stix_constants import AUTONOMOUS_SYSTEM


class AutonomousSystemNumberConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(AUTONOMOUS_SYSTEM, ["number"]), int(value))
        observation = ObservationExpression(ece1)
        return observation
