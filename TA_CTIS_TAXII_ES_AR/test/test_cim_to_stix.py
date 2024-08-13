from TA_CTIS_TAXII_ES_AR.package.bin.cim_to_stix import convert_cim_to_stix2_pattern
import pytest


class TestCimToStix:
    def test_dest_ipv6(self):
        pattern = convert_cim_to_stix2_pattern("dest_ip", "2001:0db8:85a3:0000:0000:8a2e:0370:7334")
        assert pattern == "[network-traffic:dst_ref.type = 'ipv6-addr' AND network-traffic:dst_ref.value = '2001:0db8:85a3:0000:0000:8a2e:0370:7334']"

    def test_dest_ipv4(self):
        pattern = convert_cim_to_stix2_pattern("dest_ip", "1.2.3.4")
        assert pattern == "[network-traffic:dst_ref.type = 'ipv4-addr' AND network-traffic:dst_ref.value = '1.2.3.4']"

    def test_should_throw_error_if_dest_ip_is_invalid(self):
        with pytest.raises(NotImplementedError):
            convert_cim_to_stix2_pattern("dest_ip", "abc")

    def test_should_throw_error_if_field_name_not_supported(self):
        with pytest.raises(NotImplementedError):
            convert_cim_to_stix2_pattern("random_field", "")
