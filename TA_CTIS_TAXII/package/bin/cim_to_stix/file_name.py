from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter


class FileNameConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath("file", ["name"]), value)
        observation = ObservationExpression(ece)
        return observation
