from stix2 import AndBooleanExpression, EqualityComparisonExpression, ObjectPath, ObservationExpression
from stix2.patterns import _PatternExpression

from .base_converter import CIMToSTIXConverter
from .stix_constants import NETWORK_TRAFFIC


def generate_network_port_observation(value: str, protocol: str, is_dest=True) -> _PatternExpression:
    try:
        port_number = int(value)
    except ValueError:
        raise ValueError(f"Port number {value} must be an integer.")
    dest_or_src_property_path = "dst_port" if is_dest else "src_port"
    ece1 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, [dest_or_src_property_path]), port_number)
    ece2 = EqualityComparisonExpression(ObjectPath(NETWORK_TRAFFIC, ["protocols[*]"]), protocol)
    observation = ObservationExpression(AndBooleanExpression([ece1, ece2]))
    return observation


class DestinationTCPPortConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        return generate_network_port_observation(value, protocol="tcp", is_dest=True)


class SourceTCPPortConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        return generate_network_port_observation(value, protocol="tcp", is_dest=False)


class DestinationUDPPortConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        return generate_network_port_observation(value, protocol="udp", is_dest=True)


class SourceUDPPortConverter(CIMToSTIXConverter):
    @staticmethod
    def convert(value: str) -> _PatternExpression:
        return generate_network_port_observation(value, protocol="udp", is_dest=False)
