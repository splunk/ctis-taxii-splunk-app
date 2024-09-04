import pytest

from TA_CTIS_TAXII.package.bin.cim_to_stix import IoCCategory, convert_to_stix_pattern

class TestLookupConverterByCategory:
    def test_lookup(self):
        category = IoCCategory('destination_domain')
        assert category == IoCCategory.DESTINATION_DOMAIN

class TestOther:
    def test_should_throw_error_if_field_name_not_supported(self):
        with pytest.raises(NotImplementedError):
            convert_to_stix_pattern(category="something else", value="1.2.3.4")


class TestFileName:
    def test_filename(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.FILE_NAME, value="hello.exe")
        assert pattern == "[file:name = 'hello.exe']"


class TestFilePath:
    def test_filepath(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.FILE_PATH, value=r"C:\Windows\System32")
        assert pattern == r"[file:parent_directory_ref.path = 'C:\Windows\System32']"


class TestFileHashes:
    def test_invalid_hash(self):
        with pytest.raises(ValueError):
            convert_to_stix_pattern(category=IoCCategory.FILE_HASH_MD5, value="abc")

    def test_md5(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.FILE_HASH_MD5, value="cead3f77f6cda6ec00f57d76c9a6879f")
        assert pattern == "[file:hashes.MD5 = 'cead3f77f6cda6ec00f57d76c9a6879f']"

    def test_sha1(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.FILE_HASH_SHA1,
                                          value="aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d")
        assert pattern == "[file:hashes.'SHA-1' = 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d']"

    def test_sha256(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.FILE_HASH_SHA256,
                                          value="bf07a7fbb825fc0aae7bf4a1177b2b31fcf8a3feeaf7092761e18c859ee52a9c")
        assert pattern == "[file:hashes.'SHA-256' = 'bf07a7fbb825fc0aae7bf4a1177b2b31fcf8a3feeaf7092761e18c859ee52a9c']"

    def test_sha512(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.FILE_HASH_SHA512,
                                          value="401b09eab3c013d4ca54922bb802bec8fd5318192b0a75f201d8b3727429080fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1")
        assert pattern == "[file:hashes.'SHA-512' = '401b09eab3c013d4ca54922bb802bec8fd5318192b0a75f201d8b3727429080fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1']"


class TestNetworkTraffic:
    def test_dest_ipv6(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.DESTINATION_IPV6,
                                          value="2001:0db8:85a3:0000:0000:8a2e:0370:7334")
        assert pattern == "[network-traffic:dst_ref.type = 'ipv6-addr' AND network-traffic:dst_ref.value = '2001:0db8:85a3:0000:0000:8a2e:0370:7334']"

    def test_dest_ipv4_with_cidr_slash(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.DESTINATION_IPV4, value="1.2.3.4/32")
        assert pattern == "[network-traffic:dst_ref.type = 'ipv4-addr' AND network-traffic:dst_ref.value = '1.2.3.4/32']"

    def test_dest_ipv4(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.DESTINATION_IPV4, value="1.2.3.4")
        assert pattern == "[network-traffic:dst_ref.type = 'ipv4-addr' AND network-traffic:dst_ref.value = '1.2.3.4']"

    def test_src_ipv4(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.SOURCE_IPV4, value="1.2.3.4")
        assert pattern == "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']"

    def test_src_ipv4_with_cidr_slash(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.SOURCE_IPV4, value="1.2.3.4/32")
        assert pattern == "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4/32']"

    def test_src_ipv6(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.SOURCE_IPV6,
                                          value="2001:0db8:85a3:0000:0000:8a2e:0370:7334")
        assert pattern == "[network-traffic:src_ref.type = 'ipv6-addr' AND network-traffic:src_ref.value = '2001:0db8:85a3:0000:0000:8a2e:0370:7334']"

    def test_src_domain(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.SOURCE_DOMAIN, value="example.com")
        assert pattern == "[network-traffic:src_ref.type = 'domain-name' AND network-traffic:src_ref.value = 'example.com']"

    def test_dest_domain(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.DESTINATION_DOMAIN, value="example.com")
        assert pattern == "[network-traffic:dst_ref.type = 'domain-name' AND network-traffic:dst_ref.value = 'example.com']"

    def test_dest_mac_address(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.DESTINATION_MAC_ADDRESS, value="06:10:9f:eb:8f:14")
        assert pattern == "[network-traffic:dst_ref.type = 'mac-addr' AND network-traffic:dst_ref.value = '06:10:9f:eb:8f:14']"

    def test_source_mac_address(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.SOURCE_MAC_ADDRESS, value="06:10:9f:eb:8f:14")
        assert pattern == "[network-traffic:src_ref.type = 'mac-addr' AND network-traffic:src_ref.value = '06:10:9f:eb:8f:14']"

    def test_url(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.URL, value="https://example.com")
        assert pattern == "[url:value = 'https://example.com']"

    def test_email_sender(self):
        pattern = convert_to_stix_pattern(category=IoCCategory.EMAIL_SENDER, value="abc@email.com")
        assert pattern == "[email-message:sender_ref.value = 'abc@email.com']"
