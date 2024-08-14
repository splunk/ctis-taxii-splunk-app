from .destination_ipv4 import DestinationIpv4Converter
from .destination_ipv6 import DestinationIpv6Converter
from .source_ipv4 import SourceIpv4Converter
from .source_ipv6 import SourceIpv6Converter
from .source_domain import SourceDomainConverter
from .destination_domain import DestinationDomainConverter
from .destination_mac import DestinationMacAddressConverter
from .source_mac import SourceMacAddressConverter
from .file_hash import FileHashConverter


"""
TODO
- IPv4 & IPv6: dest_ip, src_ip
- Domain/Hostname: dest_host, dest_name, src_host, src_name
- MAC Address: dest_mac, src_mac

# https://docs.splunk.com/Documentation/CIM/5.3.2/User/Malware
- file_name
- file_hash
- file_path

Sample of STIX patterns:
https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_alhyho8zsnmv
"""
CONVERTER_CLASSES = [
    DestinationIpv4Converter, DestinationIpv6Converter,
    SourceIpv4Converter, SourceIpv6Converter,
    SourceDomainConverter, DestinationDomainConverter,
    SourceMacAddressConverter, DestinationMacAddressConverter,
    FileHashConverter
]


def convert_cim_to_stix2_pattern(splunk_field_name: str, splunk_field_value: str) -> str:
    for converter in CONVERTER_CLASSES:
        if converter.supports(splunk_field_name, splunk_field_value):
            return str(converter.convert(splunk_field_name, splunk_field_value))
    else:
        raise NotImplementedError(f"Field name/value {splunk_field_name}={splunk_field_value} is not supported")
