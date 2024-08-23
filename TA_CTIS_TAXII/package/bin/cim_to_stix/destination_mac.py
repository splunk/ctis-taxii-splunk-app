from typing import Optional

from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .ioc_category import IoCCategory
from .base_converter import CIMToSTIXConverter
from .cim_fields import DESTINATION_MAC_ADDRESS
from .stix_constants import NETWORK_TRAFFIC, MAC_ADDRESS


class DestinationMacAddressConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["dst_ref", "type"]), MAC_ADDRESS)
        ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["dst_ref", "value"]), splunk_field_value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def supports(ioc_category: str, value: str) -> bool:
        return False

    @staticmethod
    def suggest_category(splunk_field_name:str, splunk_field_value:str) -> Optional[IoCCategory]:
        if splunk_field_name == DESTINATION_MAC_ADDRESS:
            return IoCCategory.DESTINATION_MAC_ADDRESS
