from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

from attrs import define, field

from .base import BaseModelV1, make_base_converter


class SubmissionStatus(Enum):
    SCHEDULED = "SCHEDULED"
    SENT = "SENT"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


@define(slots=False, kw_only=True)
class SubmissionModelV1(BaseModelV1):
    grouping_id: str = field()
    submission_id: str = field(factory=lambda: str(uuid4()))
    scheduled_at: datetime = field(factory=datetime.utcnow)
    bundle_json_sent: Optional[str] = field(default=None)
    status: SubmissionStatus = field()
    taxii_config_name: str = field()
    collection_id: str = field()
    response_json: Optional[str] = field(default=None)
    error_message: Optional[str] = field(default=None)

submission_converter = make_base_converter()
