from datetime import datetime, timedelta

def datetime_in_future(in_future: timedelta) -> datetime:
    now = datetime.utcnow()
    return now + in_future


def timestamp_in_future(in_future: timedelta) -> str:
    dt = datetime_in_future(in_future=in_future)
    # No timezone info is expected, UTC is assumed.
    timestamp = dt.isoformat(timespec="seconds")
    return timestamp
