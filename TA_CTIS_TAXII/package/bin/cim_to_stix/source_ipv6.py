from typing import Optional

from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .ioc_category import IoCCategory
from .base_converter import CIMToSTIXConverter
from .util import ip_is_ipv6
from .cim_fields import SOURCE_IP
from .stix_constants import NETWORK_TRAFFIC


class SourceIpv6Converter(CIMToSTIXConverter):

    @staticmethod
    def convert(value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["src_ref", "type"]), "ipv6-addr")
        ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["src_ref", "value"]), value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def category(value: str) -> IoCCategory:
        return IoCCategory.SOURCE_IPV6

    @staticmethod
    def supports_field(splunk_field_name: str, splunk_field_value: str) -> bool:
        return splunk_field_name == SOURCE_IP and ip_is_ipv6(splunk_field_value)
