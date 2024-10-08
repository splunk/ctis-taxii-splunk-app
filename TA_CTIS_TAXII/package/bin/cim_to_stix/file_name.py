from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter
from .ioc_category import IoCCategory


class FileNameConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath("file", ["name"]), value)
        observation = ObservationExpression(ece)
        return observation

    @staticmethod
    def category(value: str) -> IoCCategory:
        return IoCCategory.FILE_NAME
