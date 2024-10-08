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
    def convert(value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["dst_ref", "type"]), "ipv6-addr")
        ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["dst_ref", "value"]), value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def category(value: str) -> IoCCategory:
        return IoCCategory.DESTINATION_IPV6
