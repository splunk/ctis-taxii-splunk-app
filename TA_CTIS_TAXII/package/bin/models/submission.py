from datetime import datetime
from enum import Enum
from uuid import uuid4

from attrs import define, field

from .base import BaseModelV1


class SubmissionStatus(Enum):
    SCHEDULED = "SCHEDULED"
    SENT = "SENT"
    FAILED = "FAILED"


@define(slots=False, kw_only=True)
class SubmissionModelV1(BaseModelV1):
    submission_id: str = field(factory=lambda: str(uuid4()))
    scheduled_at: datetime = field(factory=datetime.utcnow)
    bundle_json: str = field()
    status: SubmissionStatus = field()
    taxii_config_name: str = field()
    collection_id: str = field()
    response_json: str = field(default=None)
    error_message: str = field(default=None)
