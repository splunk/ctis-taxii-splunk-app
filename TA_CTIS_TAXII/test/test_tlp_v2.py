from TA_CTIS_TAXII.package.bin.models.tlp_v2 import TLPv2

class TestTLPv2:
    def test_tlp_clear(self):
        marking_ref = TLPv2.CLEAR.to_object_marking_ref()
        assert marking_ref["name"] == "TLP:CLEAR"

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

