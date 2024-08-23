from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter
from .cim_fields import SOURCE_MAC_ADDRESS as CIM_SOURCE_MAC_ADDRESS
from .ioc_category import IoCCategory
from .stix_constants import MAC_ADDRESS, NETWORK_TRAFFIC


class SourceMacAddressConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["src_ref", "type"]), MAC_ADDRESS)
        ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["src_ref", "value"]), value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def category(value: str) -> IoCCategory:
        return IoCCategory.SOURCE_MAC_ADDRESS

    @staticmethod
    def supports_field(splunk_field_name: str, splunk_field_value: str) -> bool:
        return splunk_field_name == CIM_SOURCE_MAC_ADDRESS
