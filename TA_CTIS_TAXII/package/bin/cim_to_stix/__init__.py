from .destination_ipv4 import DestinationIpv4Converter
from .destination_ipv6 import DestinationIpv6Converter
from .source_ipv4 import SourceIpv4Converter
from .source_ipv6 import SourceIpv6Converter
from .source_domain import SourceDomainConverter
from .destination_domain import DestinationDomainConverter
from .destination_mac import DestinationMacAddressConverter
from .source_mac import SourceMacAddressConverter
from .file_hash import FileHashConverter
from .file_name import FileNameConverter
from .file_path import FilePathConverter
from .ioc_category import IoCCategory

"""
TODO
- Command line invocation? E.g. cmd.exe /C regsvr32.exe /s /u /i

DONE
- IPv4 & IPv6: dest_ip, src_ip
- Domain/Hostname: dest_host, dest_name, src_host, src_name
- MAC Address: dest_mac, src_mac
# https://docs.splunk.com/Documentation/CIM/5.3.2/User/Malware
- file_hash
- file_name
- file_path



Sample of STIX patterns:
https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_alhyho8zsnmv
"""
CONVERTER_CLASSES = [
    DestinationIpv4Converter, DestinationIpv6Converter,
    SourceIpv4Converter, SourceIpv6Converter,
    SourceDomainConverter, DestinationDomainConverter,
    SourceMacAddressConverter, DestinationMacAddressConverter,
    FileHashConverter, FileNameConverter, FilePathConverter
]

def convert_to_stix_pattern(category: IoCCategory, value: str) -> str:
    for converter in CONVERTER_CLASSES:
        if converter.supports(category, value):
            return str(converter.convert(value))
    else:
        raise NotImplementedError(f"Field name/value {category}={value} is not supported")

def convert_splunk_field_to_category(splunk_field_name: str, splunk_field_value:str) -> IoCCategory:
    for converter in CONVERTER_CLASSES:
        if converter.supports_field(splunk_field_name, splunk_field_value):
            return converter.category(value=splunk_field_value)
    else:
        raise ValueError(f"Category conversion for {repr(splunk_field_name)}={repr(splunk_field_value)} is not supported.")
