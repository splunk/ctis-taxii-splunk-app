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
from .url import UrlConverter
from .email_sender import EmailSenderConverter

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

"""
From Austin Harvey (Deloitte)

The top 5 IOC types we currently receive from Partners are:

Domains
- [X] Domains
- [X] URLs
- [X] IP addresses (IPv4 most common)
- [X] File Hashes (MD5 and SHA256 most common)
- [X] Source email addresses
- [ ] Email
    - [ ] Sender address
    - [ ] Email body
    - [ ] Email subject
    - [ ] Email attachment filename
"""

"""
Matching on an Email Message with specific Sender and Subject
[email-message:sender_ref.value = 'jdoe@example.com' AND email-message:subject = 'Conference Info']

Matching an Email Message with a particular From Email Address and Attachment File Name Using a Regular Expression
[email-message:from_ref.value MATCHES '.+\\@example\\.com$' AND email-message:body_multipart[*].body_raw_ref.name MATCHES '^Final Report.+\\.exe$']
"""

CONVERTER_CLASSES = [
    DestinationIpv4Converter, DestinationIpv6Converter,
    SourceIpv4Converter, SourceIpv6Converter,
    SourceDomainConverter, DestinationDomainConverter,
    SourceMacAddressConverter, DestinationMacAddressConverter,
    FileHashConverter, FileNameConverter, FilePathConverter,
    UrlConverter,
    EmailSenderConverter
]

CATEGORY_TO_CONVERTER = {
    IoCCategory.DESTINATION_IPV4: DestinationIpv4Converter,
    IoCCategory.DESTINATION_IPV6: DestinationIpv6Converter,
    IoCCategory.SOURCE_IPV4: SourceIpv4Converter,
    IoCCategory.SOURCE_IPV6: SourceIpv6Converter,
    IoCCategory.SOURCE_DOMAIN: SourceDomainConverter,
    IoCCategory.DESTINATION_DOMAIN: DestinationDomainConverter,
    IoCCategory.DESTINATION_MAC_ADDRESS: DestinationMacAddressConverter,
    IoCCategory.SOURCE_MAC_ADDRESS: SourceMacAddressConverter,
    IoCCategory.FILE_HASH_MD5: FileHashConverter,
    IoCCategory.FILE_HASH_SHA1: FileHashConverter,
    IoCCategory.FILE_HASH_SHA256: FileHashConverter,
    IoCCategory.FILE_HASH_SHA512: FileHashConverter,
    IoCCategory.FILE_NAME: FileNameConverter,
    IoCCategory.FILE_PATH: FilePathConverter,
    IoCCategory.URL: UrlConverter,
    IoCCategory.EMAIL_SENDER: EmailSenderConverter
}

def convert_to_stix_pattern(category: IoCCategory, value: str) -> str:
    converter = CATEGORY_TO_CONVERTER.get(category)
    if converter is None:
        raise NotImplementedError(f"Category {category} is not supported")
    return str(converter.convert(value))

def convert_splunk_field_to_category(splunk_field_name: str, splunk_field_value:str) -> IoCCategory:
    for converter in CONVERTER_CLASSES:
        if converter.supports_field(splunk_field_name, splunk_field_value):
            return converter.category(value=splunk_field_value)
    else:
        raise ValueError(f"Category conversion for {repr(splunk_field_name)}={repr(splunk_field_value)} is not supported.")
