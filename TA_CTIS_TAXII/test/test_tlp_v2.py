from TA_CTIS_TAXII.package.bin.models.tlp_v2 import TLPv2
import pytest

TLP_2_AMBER_MARKING_DEFINITION = "marking-definition--55d920b0-5e8b-4f79-9ee9-91f868d9b421"
TLP_2_CLEAR_MARKING_DEFINITION = "marking-definition--94868c89-83c2-464b-929b-a1a8aa3c8487"

class TestTLPv2:
    def test_tlp_clear(self):
        marking_ref = TLPv2.CLEAR.to_object_marking_ref()
        assert marking_ref["name"] == "TLP:CLEAR"

        assert TLPv2.CLEAR.value == "TLP:CLEAR"

    def test_tlp_amber(self):
        marking_ref = TLPv2.AMBER.to_object_marking_ref()
        assert marking_ref["name"] == "TLP:AMBER"

    def test_tlp_green(self):
        marking_ref = TLPv2.GREEN.to_object_marking_ref()
        assert marking_ref["name"] == "TLP:GREEN"

    def test_tlp_red(self):
        marking_ref = TLPv2.RED.to_object_marking_ref()
        assert marking_ref["name"] == "TLP:RED"

    def test_tlp_amber_strict(self):
        marking_ref = TLPv2.AMBER_STRICT.to_object_marking_ref()
        assert marking_ref["name"] == "TLP:AMBER+STRICT"
        assert marking_ref.id == "marking-definition--939a9414-2ddd-4d32-a0cd-375ea402b003"
        assert TLPv2.AMBER_STRICT.value == "TLP:AMBER+STRICT"

    @pytest.mark.parametrize("tlp1, tlp2, expected", [
        (TLPv2.CLEAR, TLPv2.AMBER, TLPv2.AMBER),
        (TLPv2.RED, TLPv2.GREEN, TLPv2.RED),
        (TLPv2.AMBER, TLPv2.RED, TLPv2.RED),
        (TLPv2.AMBER, TLPv2.AMBER_STRICT, TLPv2.AMBER_STRICT),
        (TLPv2.GREEN, TLPv2.GREEN, TLPv2.GREEN),
    ])
    def test_maximum_tlp_value(self, tlp1, tlp2, expected):
        assert TLPv2.maximum(tlp1, tlp2) == expected

    def test_parse_from_object_marking_refs(self):
        assert TLPv2.from_object_marking_refs(["something else", TLP_2_CLEAR_MARKING_DEFINITION]) == TLPv2.CLEAR
        assert TLPv2.from_object_marking_refs([TLP_2_AMBER_MARKING_DEFINITION]) == TLPv2.AMBER
