from TA_CTIS_TAXII_ES_AR.package.bin.cim_to_stix import convert_cim_to_stix2_pattern
import pytest


class TestOther:
    def test_should_throw_error_if_field_name_not_supported(self):
        with pytest.raises(NotImplementedError):
            convert_cim_to_stix2_pattern("random_field", "")

class TestFileName:
    @pytest.mark.parametrize("field_name", ["file_name", "filename"])
    def test_filename(self, field_name):
        pattern = convert_cim_to_stix2_pattern(field_name, "hello.exe")
        assert pattern == "[file:name = 'hello.exe']"


class TestFileHashes:
    def test_invalid_hash(self):
        with pytest.raises(NotImplementedError):
            convert_cim_to_stix2_pattern("file_hash", "abc")

    def test_md5(self):
        pattern = convert_cim_to_stix2_pattern("file_hash", "cead3f77f6cda6ec00f57d76c9a6879f")
        assert pattern == "[file:hashes.MD5 = 'cead3f77f6cda6ec00f57d76c9a6879f']"

    def test_sha1(self):
        pattern = convert_cim_to_stix2_pattern("file_hash", "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d")
        assert pattern == "[file:hashes.'SHA-1' = 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d']"

    def test_sha256(self):
        pattern = convert_cim_to_stix2_pattern("file_hash",
                                               "bf07a7fbb825fc0aae7bf4a1177b2b31fcf8a3feeaf7092761e18c859ee52a9c")
        assert pattern == "[file:hashes.'SHA-256' = 'bf07a7fbb825fc0aae7bf4a1177b2b31fcf8a3feeaf7092761e18c859ee52a9c']"

    def test_sha512(self):
        pattern = convert_cim_to_stix2_pattern("file_hash",
                                               "401b09eab3c013d4ca54922bb802bec8fd5318192b0a75f201d8b3727429080fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1")
        assert pattern == "[file:hashes.'SHA-512' = '401b09eab3c013d4ca54922bb802bec8fd5318192b0a75f201d8b3727429080fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1']"


class TestNetworkTraffic:
    def test_dest_ipv6(self):
        pattern = convert_cim_to_stix2_pattern("dest_ip", "2001:0db8:85a3:0000:0000:8a2e:0370:7334")
        assert pattern == "[network-traffic:dst_ref.type = 'ipv6-addr' AND network-traffic:dst_ref.value = '2001:0db8:85a3:0000:0000:8a2e:0370:7334']"

    def test_dest_ipv4(self):
        pattern = convert_cim_to_stix2_pattern("dest_ip", "1.2.3.4")
        assert pattern == "[network-traffic:dst_ref.type = 'ipv4-addr' AND network-traffic:dst_ref.value = '1.2.3.4']"

    def test_src_ipv4(self):
        pattern = convert_cim_to_stix2_pattern("src_ip", "1.2.3.4")
        assert pattern == "[network-traffic:src_ref.type = 'ipv4-addr' AND network-traffic:src_ref.value = '1.2.3.4']"

    def test_src_ipv6(self):
        pattern = convert_cim_to_stix2_pattern("src_ip", "2001:0db8:85a3:0000:0000:8a2e:0370:7334")
        assert pattern == "[network-traffic:src_ref.type = 'ipv6-addr' AND network-traffic:src_ref.value = '2001:0db8:85a3:0000:0000:8a2e:0370:7334']"

    @pytest.mark.parametrize("field_name", ["src_host", "src_name"])
    def test_src_domain(self, field_name):
        pattern = convert_cim_to_stix2_pattern(field_name, "example.com")
        assert pattern == "[network-traffic:src_ref.type = 'domain-name' AND network-traffic:src_ref.value = 'example.com']"

    @pytest.mark.parametrize("field_name", ["dest_host", "dest_name"])
    def test_dest_domain(self, field_name):
        pattern = convert_cim_to_stix2_pattern(field_name, "example.com")
        assert pattern == "[network-traffic:dst_ref.type = 'domain-name' AND network-traffic:dst_ref.value = 'example.com']"

    def test_should_throw_error_if_dest_ip_is_invalid(self):
        with pytest.raises(NotImplementedError):
            convert_cim_to_stix2_pattern("dest_ip", "abc")

    def test_dest_mac_address(self):
        pattern = convert_cim_to_stix2_pattern("dest_mac", "06:10:9f:eb:8f:14")
        assert pattern == "[network-traffic:dst_ref.type = 'mac-addr' AND network-traffic:dst_ref.value = '06:10:9f:eb:8f:14']"

    def test_source_mac_address(self):
        pattern = convert_cim_to_stix2_pattern("src_mac", "06:10:9f:eb:8f:14")
        assert pattern == "[network-traffic:src_ref.type = 'mac-addr' AND network-traffic:src_ref.value = '06:10:9f:eb:8f:14']"
