from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression
from .base_converter import CIMToSTIXConverter


class DestinationIpv4Converter(CIMToSTIXConverter):

    @staticmethod
    def convert(splunk_field_name: str, splunk_field_value: str) -> _PatternExpression:
        ece1 = EqualityComparisonExpression(ObjectPath("network-traffic", ["dst_ref", "type"]), "ipv4-addr")
        ece2 = EqualityComparisonExpression(ObjectPath("network-traffic", ["dst_ref", "value"]), splunk_field_value)
        observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
        return observation

    @staticmethod
    def supports(splunk_field_name: str) -> bool:
        return splunk_field_name == "dest_ip"
