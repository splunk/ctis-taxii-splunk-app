import json

from TA_CTIS_TAXII.package.bin.models import GroupingModelV1, IdentityModelV1, bundle_for_grouping
from TA_CTIS_TAXII.package.bin.models.tlp_v2 import TLPv2, GREEN_MARKING_DEFINITION, RED_MARKING_DEFINITION
from test_model_indicator_v1 import new_sample_indicator_instance


class TestStixBundle:
    def test_bundling_grouping_of_indicators(self):
        identity = IdentityModelV1(name="Test Identity", identity_class="organization")
        grouping = GroupingModelV1(name="Group ABC", description="Group ABC description", context="unspecified",
                                   created_by_ref=identity.identity_id)
        indicator1 = new_sample_indicator_instance()
        indicator1.grouping_id = grouping.grouping_id
        indicator1.stix_pattern = "[domain-name:value = 'malicious-domain.com']"
        indicator1.tlp_v2_rating = TLPv2.RED

        indicator2 = new_sample_indicator_instance()
        indicator2.grouping_id = grouping.grouping_id
        indicator2.stix_pattern = "[file:name = 'hello.exe']"
        indicator2.tlp_v2_rating = TLPv2.GREEN

        indicator3 = new_sample_indicator_instance()
        indicator3.grouping_id = grouping.grouping_id
        indicator3.stix_pattern = "[network-traffic:dst_ref.type = 'ipv4-addr' AND network-traffic:dst_ref.value = '1.2.3.4']"
        indicator3.tlp_v2_rating = TLPv2.GREEN

        bundle = bundle_for_grouping(grouping_=grouping, grouping_identity=identity,
                                     indicators=[indicator1, indicator2, indicator3])
        bundle_json = json.loads(bundle.serialize())
        assert bundle_json["type"] == "bundle"
        assert len(bundle_json["objects"]) == 7

        object_id_to_type = {x["id"]: x["type"] for x in bundle_json["objects"]}

        assert object_id_to_type[grouping.grouping_id] == "grouping"
        assert object_id_to_type[identity.identity_id] == "identity"

        assert object_id_to_type[indicator1.indicator_id] == "indicator"
        assert object_id_to_type[indicator2.indicator_id] == "indicator"
        assert object_id_to_type[indicator3.indicator_id] == "indicator"

        # Only unique TLP ratings should be added to the bundle
        assert object_id_to_type[RED_MARKING_DEFINITION.id] == "marking-definition"
        assert object_id_to_type[GREEN_MARKING_DEFINITION.id] == "marking-definition"
