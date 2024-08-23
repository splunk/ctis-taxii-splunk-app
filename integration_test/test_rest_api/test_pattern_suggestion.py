from util import post_endpoint

class TestScenarios:
    def test_pattern_suggestion(self, session):
        file_md5_hash = "5d41402abc4b2a76b9719d911017c592"
        resp = post_endpoint(endpoint="suggest-stix-pattern", session=session, payload={
            "indicator_category": "file_hash_md5",
            "indicator_value": file_md5_hash
        })
        assert resp["pattern"] == f"[file:hashes.MD5 = '{file_md5_hash}']"


"""
TODO: Endpoints for:
- conversion from (splunk field name, splunk field value) to IOC Category
- optionally: list available IOC Categories?
"""
