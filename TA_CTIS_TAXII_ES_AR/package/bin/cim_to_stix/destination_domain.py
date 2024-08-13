from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression
from .base_converter import CIMToSTIXConverter
from .cim_fields import DESTINATION_DOMAIN_NAME, DESTINATION_HOST_NAME
from .stix_constants import DOMAIN_NAME, NETWORK_TRAFFIC


class DestinationDomainConverter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["dst_ref", "type"]), DOMAIN_NAME)
        ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["dst_ref", "value"]), splunk_field_value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def supports(splunk_field_name: str, splunk_field_value: str) -> bool:
        return splunk_field_name in (DESTINATION_HOST_NAME, DESTINATION_DOMAIN_NAME)
