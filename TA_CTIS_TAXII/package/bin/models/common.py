from __future__ import annotations

from datetime import datetime

from dateutil.parser import parse as parse_date


def validate_confidence(instance, attribute, value: int):
    if not 0 <= value <= 100:
        raise ValueError("confidence must be between 0 and 100")


def parse_iso8601_to_naive_datetime(value: str) -> datetime:
    # TODO: Truncate down sub-seconds to at most 3 decimal places (millisecond precision)
    return parse_date(value, ignoretz=True)
