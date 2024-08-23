from typing import Optional

from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression
from .base_converter import CIMToSTIXConverter
from .util import ip_is_ipv6
from .cim_fields import DESTINATION_IP
from .stix_constants import NETWORK_TRAFFIC
from .ioc_category import IoCCategory

class DestinationIpv6Converter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["dst_ref", "type"]), "ipv6-addr")
        ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["dst_ref", "value"]), splunk_field_value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def supports(ioc_category: str, value: str) -> bool:
        return ioc_category == DESTINATION_IP and ip_is_ipv6(value)

    @staticmethod
    def suggest_category(splunk_field_name:str, splunk_field_value:str) -> Optional[IoCCategory]:
        if splunk_field_name == DESTINATION_IP and ip_is_ipv6(splunk_field_value):
            return IoCCategory.DESTINATION_IPV6
