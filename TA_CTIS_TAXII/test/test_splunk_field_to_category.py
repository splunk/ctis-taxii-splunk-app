import pytest
from TA_CTIS_TAXII.package.bin.cim_to_stix import convert_splunk_field_name_to_category
from TA_CTIS_TAXII.package.bin.cim_to_stix import IoCCategory

IPV6_ADDRESS = "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
IPV4_ADDRESS = "1.2.3.4"
IPV4_CIDR = "1.2.3.4/32"
MAC_ADDRESS = "06:10:9f:eb:8f:14"

class TestUnsupportedField:
    def test_unsupported_field(self):
        with pytest.raises(ValueError):
            convert_splunk_field_name_to_category("unsupported_field", "value")

class TestFileNameAndPath:
    def test_file_path(self):
        converted_category = convert_splunk_field_name_to_category("file_path", splunk_field_value="/path/to/file")
        assert converted_category == IoCCategory.FILE_PATH

    def test_file_name(self):
        converted_category = convert_splunk_field_name_to_category("file_name", splunk_field_value="file.exe")
        assert converted_category == IoCCategory.FILE_NAME


class TestFileHashes:
    def test_invalid_file_hash(self):
        with pytest.raises(ValueError):
            convert_splunk_field_name_to_category("file_hash", splunk_field_value="invalid_hash")

    def test_md5(self):
        converted_category = convert_splunk_field_name_to_category("file_hash",
                                                                   splunk_field_value="d41d8cd98f00b204e9800998ecf8427e")
        assert converted_category == IoCCategory.FILE_HASH_MD5

    def test_sha1(self):
        converted_category = convert_splunk_field_name_to_category("file_hash",
                                                                   splunk_field_value="aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d")
        assert converted_category == IoCCategory.FILE_HASH_SHA1

    def test_sha256(self):
        converted_category = convert_splunk_field_name_to_category("file_hash",
                                                                   splunk_field_value="bf07a7fbb825fc0aae7bf4a1177b2b31fcf8a3feeaf7092761e18c859ee52a9c")
        assert converted_category == IoCCategory.FILE_HASH_SHA256

    def test_sha512(self):
        converted_category = convert_splunk_field_name_to_category("file_hash",
                                                                   splunk_field_value="401b09eab3c013d4ca54922bb802bec8fd5318192b0a75f201d8b3727429080fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1")
        assert converted_category == IoCCategory.FILE_HASH_SHA512


class TestNetworkTraffic:
    @pytest.mark.parametrize("field_name", ["dest_host", "dest_name"])
    def test_dest_domain(self, field_name):
        converted_category = convert_splunk_field_name_to_category(field_name, splunk_field_value="example.com")
        assert converted_category == IoCCategory.DESTINATION_DOMAIN

    @pytest.mark.parametrize("field_name", ["src_host", "src_name"])
    def test_src_domain(self, field_name):
        converted_category = convert_splunk_field_name_to_category(field_name, splunk_field_value="example.com")
        assert converted_category == IoCCategory.SOURCE_DOMAIN

    def test_dest_ipv6(self):
        converted_category = convert_splunk_field_name_to_category("dest_ip", splunk_field_value=IPV6_ADDRESS)
        assert converted_category == IoCCategory.DESTINATION_IPV6

    def test_src_ipv6(self):
        converted_category = convert_splunk_field_name_to_category("src_ip", splunk_field_value=IPV6_ADDRESS)
        assert converted_category == IoCCategory.SOURCE_IPV6

    def test_dest_ipv4_with_cidr_slash(self):
        converted_category = convert_splunk_field_name_to_category("dest_ip", splunk_field_value=IPV4_CIDR)
        assert converted_category == IoCCategory.DESTINATION_IPV4

    def test_dest_ipv4(self):
        converted_category = convert_splunk_field_name_to_category("dest_ip", splunk_field_value=IPV4_ADDRESS)
        assert converted_category == IoCCategory.DESTINATION_IPV4

    def test_src_ipv4(self):
        converted_category = convert_splunk_field_name_to_category("src_ip", splunk_field_value=IPV4_ADDRESS)
        assert converted_category == IoCCategory.SOURCE_IPV4

    def test_src_ipv4_with_cidr_slash(self):
        converted_category = convert_splunk_field_name_to_category("src_ip", splunk_field_value=IPV4_CIDR)
        assert converted_category == IoCCategory.SOURCE_IPV4

    def test_should_validate_dest_ip(self):
        with pytest.raises(ValueError):
            convert_splunk_field_name_to_category("dest_ip", splunk_field_value="invalid_ip")

    def test_dest_mac_address(self):
        converted_category = convert_splunk_field_name_to_category("dest_mac", splunk_field_value=MAC_ADDRESS)
        assert converted_category == IoCCategory.DESTINATION_MAC_ADDRESS

    def test_source_mac_address(self):
        converted_category = convert_splunk_field_name_to_category("src_mac", splunk_field_value=MAC_ADDRESS)
        assert converted_category == IoCCategory.SOURCE_MAC_ADDRESS
