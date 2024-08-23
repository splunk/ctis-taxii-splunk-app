from typing import Optional

from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .ioc_category import IoCCategory
from .base_converter import CIMToSTIXConverter


class FileNameConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath("file", ["name"]), splunk_field_value)
        observation = ObservationExpression(ece)
        return observation

    @staticmethod
    def category(value: str) -> IoCCategory:
        return IoCCategory.FILE_NAME

    @staticmethod
    def supports_field(splunk_field_name: str, splunk_field_value: str) -> bool:
        return splunk_field_name in ("file_name", "filename")
