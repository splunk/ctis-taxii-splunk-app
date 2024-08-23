from typing import Optional

from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .ioc_category import IoCCategory
from .base_converter import CIMToSTIXConverter
from .util import ip_is_ipv4
from .cim_fields import SOURCE_IP
from .stix_constants import NETWORK_TRAFFIC


class SourceIpv4Converter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["src_ref", "type"]), "ipv4-addr")
        ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["src_ref", "value"]), splunk_field_value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def supports(ioc_category: str, value: str) -> bool:
        return ioc_category == SOURCE_IP and ip_is_ipv4(value)

    @staticmethod
    def suggest_category(splunk_field_name:str, splunk_field_value:str) -> Optional[IoCCategory]:
        if splunk_field_name == SOURCE_IP and ip_is_ipv4(splunk_field_value):
            return IoCCategory.SOURCE_IPV4
