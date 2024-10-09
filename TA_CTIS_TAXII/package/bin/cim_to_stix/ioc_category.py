from enum import Enum

class IoCCategory(Enum):
    """
    IoC Category
    """
    URL = "url"

    # Domain names and hostnames
    DESTINATION_DOMAIN = "destination_domain"
    SOURCE_DOMAIN = "source_domain"

    DESTINATION_IPV4 = "destination_ipv4"
    SOURCE_IPV4 = "source_ipv4"

    DESTINATION_IPV6 = "destination_ipv6"
    SOURCE_IPV6 = "source_ipv6"

    DESTINATION_MAC_ADDRESS = "destination_mac_address"
    SOURCE_MAC_ADDRESS = "source_mac_address"

    DESTINATION_TCP_PORT = "destination_tcp_port"
    SOURCE_TCP_PORT = "source_tcp_port"
    DESTINATION_UDP_PORT = "destination_udp_port"
    SOURCE_UDP_PORT = "source_udp_port"

    FILE_HASH_MD5 = "file_hash_md5"
    FILE_HASH_SHA1 = "file_hash_sha1"
    FILE_HASH_SHA256 = "file_hash_sha256"
    FILE_HASH_SHA512 = "file_hash_sha512"

    FILE_NAME = "file_name"
    FILE_PATH = "file_path"

    EMAIL_SENDER = "email_sender"
    EMAIL_BODY = "email_body"
    EMAIL_SUBJECT = "email_subject"
    EMAIL_ATTACHMENT_FILE_NAME = "email_attachment_file_name"
