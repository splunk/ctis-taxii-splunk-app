from stix2 import EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter
from . import cim_fields
from .ioc_category import IoCCategory


class UrlConverter(CIMToSTIXConverter):

    # Example [url:value = 'http://example.com/foo']
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece = EqualityComparisonExpression(ObjectPath("url", ["value"]), value)
        observation = ObservationExpression(ece)
        return observation

    @staticmethod
    def category(value: str) -> IoCCategory:
        return IoCCategory.URL

    @staticmethod
    def supports_field(splunk_field_name: str, splunk_field_value: str) -> bool:
        return splunk_field_name == cim_fields.URL
