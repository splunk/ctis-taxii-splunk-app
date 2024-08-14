from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter


class FileNameConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath("file", ["name"]), splunk_field_value)
        observation = ObservationExpression(ece)
        return observation

    @staticmethod
    def supports(splunk_field_name: str, splunk_field_value: str) -> bool:
        return splunk_field_name in ("file_name", "filename")
