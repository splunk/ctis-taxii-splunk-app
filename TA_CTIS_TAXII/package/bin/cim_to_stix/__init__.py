from .destination_domain import DestinationDomainConverter
from .destination_ipv4 import DestinationIpv4Converter
from .destination_ipv6 import DestinationIpv6Converter
from .destination_mac import DestinationMacAddressConverter
from .email import EmailSenderConverter, EmailBodyConverter, EmailSubjectConverter, EmailAttachmentFilenameConverter
from .file_hash import MD5FileHashConverter, SHA1FileHashConverter, SHA256FileHashConverter, SHA512FileHashConverter
from .file_name import FileNameConverter
from .file_path import FilePathConverter
from .ioc_category import IoCCategory
from .source_domain import SourceDomainConverter
from .source_ipv4 import SourceIpv4Converter
from .source_ipv6 import SourceIpv6Converter
from .source_mac import SourceMacAddressConverter
from .url import UrlConverter
from .port_number import DestinationTCPPortConverter, SourceTCPPortConverter, DestinationUDPPortConverter, SourceUDPPortConverter
from .autonomous_system import AutonomousSystemNumberConverter

"""
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

CATEGORY_TO_CONVERTER = {
    IoCCategory.DESTINATION_IPV4: DestinationIpv4Converter,
    IoCCategory.DESTINATION_IPV6: DestinationIpv6Converter,
    IoCCategory.SOURCE_IPV4: SourceIpv4Converter,
    IoCCategory.SOURCE_IPV6: SourceIpv6Converter,
    IoCCategory.SOURCE_DOMAIN: SourceDomainConverter,
    IoCCategory.DESTINATION_DOMAIN: DestinationDomainConverter,
    IoCCategory.DESTINATION_MAC_ADDRESS: DestinationMacAddressConverter,
    IoCCategory.SOURCE_MAC_ADDRESS: SourceMacAddressConverter,

    IoCCategory.DESTINATION_TCP_PORT: DestinationTCPPortConverter,
    IoCCategory.SOURCE_TCP_PORT: SourceTCPPortConverter,
    IoCCategory.DESTINATION_UDP_PORT: DestinationUDPPortConverter,
    IoCCategory.SOURCE_UDP_PORT: SourceUDPPortConverter,

    IoCCategory.AUTONOMOUS_SYSTEM_NUMBER: AutonomousSystemNumberConverter,

    IoCCategory.FILE_HASH_MD5: MD5FileHashConverter,
    IoCCategory.FILE_HASH_SHA1: SHA1FileHashConverter,
    IoCCategory.FILE_HASH_SHA256: SHA256FileHashConverter,
    IoCCategory.FILE_HASH_SHA512: SHA512FileHashConverter,
    IoCCategory.FILE_NAME: FileNameConverter,
    IoCCategory.FILE_PATH: FilePathConverter,
    IoCCategory.URL: UrlConverter,
    IoCCategory.EMAIL_SENDER: EmailSenderConverter,
    IoCCategory.EMAIL_BODY: EmailBodyConverter,
    IoCCategory.EMAIL_SUBJECT: EmailSubjectConverter,
    IoCCategory.EMAIL_ATTACHMENT_FILE_NAME: EmailAttachmentFilenameConverter
}


def convert_to_stix_pattern(category: IoCCategory, value: str) -> str:
    converter = CATEGORY_TO_CONVERTER.get(category)
    if converter is None:
        raise NotImplementedError(f"Category {category} is not supported")
    return str(converter.convert(value))
