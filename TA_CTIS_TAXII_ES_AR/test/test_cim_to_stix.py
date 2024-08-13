from TA_CTIS_TAXII_ES_AR.package.bin.cim_to_stix import convert_cim_to_stix2_pattern
import pytest


class TestCimToStix:
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

    def test_should_throw_error_if_field_name_not_supported(self):
        with pytest.raises(NotImplementedError):
            convert_cim_to_stix2_pattern("random_field", "")
