from util import post_endpoint, get_endpoint

class TestScenarios:
    def test_pattern_suggestion(self, session):
        file_md5_hash = "5d41402abc4b2a76b9719d911017c592"
        resp = post_endpoint(endpoint="suggest-stix-pattern", session=session, payload={
            "indicator_category": "file_hash_md5",
            "indicator_value": file_md5_hash
        })
        assert resp["pattern"] == f"[file:hashes.MD5 = '{file_md5_hash}']"

    def test_list_ioc_categories(self, session):
        resp = get_endpoint(endpoint="list-ioc-categories", session=session)
        assert "categories" in resp
        for category in ["destination_domain", "file_hash_md5"]:
            assert category in resp["categories"]




"""
TODO: Endpoints for:
- conversion from (splunk field name, splunk field value) to IOC Category
- optionally: list available IOC Categories?
"""
