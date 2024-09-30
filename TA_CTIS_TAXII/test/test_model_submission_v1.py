from TA_CTIS_TAXII.package.bin.models import SubmissionModelV1, SubmissionStatus, submission_converter
from datetime import datetime

GROUPING_ID = "grouping--22f7d710-d9f3-4b42-81ab-d35d722936dc"

class TestSubmissionModel:
    def test_unstructure_scheduled_submission(self):
        submission = SubmissionModelV1(
            grouping_id=GROUPING_ID,
            bundle_json_sent=None,
            status=SubmissionStatus.SCHEDULED,
            scheduled_at=datetime(2024, 1, 2, 3, 4, 5),
            taxii_config_name="taxii_config",
            collection_id="abc123",
        )
        as_dict = submission_converter.unstructure(submission)
        assert as_dict["grouping_id"] == GROUPING_ID
        assert as_dict["bundle_json_sent"] is None
        assert as_dict["status"] == "SCHEDULED"
        assert as_dict["taxii_config_name"] == "taxii_config"
        assert as_dict["collection_id"] == "abc123"
        assert as_dict["scheduled_at"] == "2024-01-02T03:04:05"
        assert as_dict["response_json"] is None
        assert as_dict["error_message"] is None

    def test_unstructure_submission_now(self):
        submission = SubmissionModelV1(
            grouping_id=GROUPING_ID,
            bundle_json_sent="{}",
            status=SubmissionStatus.SCHEDULED,
            taxii_config_name="taxii_config",
            collection_id="abc123",
        )
        assert submission.grouping_id == GROUPING_ID
        assert submission.submission_id is not None
        assert submission.scheduled_at is not None, "Should be set to now if not given"
        assert submission.response_json is None
        assert submission.error_message is None

        as_dict = submission_converter.unstructure(submission)
        assert as_dict["grouping_id"] == GROUPING_ID
        assert as_dict["bundle_json_sent"] == "{}"
        assert as_dict["status"] == "SCHEDULED"
        assert as_dict["taxii_config_name"] == "taxii_config"
        assert as_dict["collection_id"] == "abc123"
        assert "submission_id" in as_dict

    def test_structure(self):
        as_dict = {
            "grouping_id" : GROUPING_ID,
            "bundle_json_sent": "{}",
            "status": "SCHEDULED",
            "taxii_config_name": "taxii_config",
            "collection_id": "abc123",
        }
        submission = submission_converter.structure(as_dict, SubmissionModelV1)
        assert submission.bundle_json_sent == "{}"
        assert submission.status == SubmissionStatus.SCHEDULED
        assert submission.taxii_config_name == "taxii_config"
        assert submission.collection_id == "abc123"
        assert submission.submission_id is not None
        assert submission.grouping_id == GROUPING_ID
