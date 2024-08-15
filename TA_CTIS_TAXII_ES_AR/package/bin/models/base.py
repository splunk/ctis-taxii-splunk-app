from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BaseModel:
    # https://dev.splunk.com/enterprise/docs/developapps/manageknowledge/kvstore/aboutkvstorecollections/
    # Reserved fields
    _key: Optional[str] = field(default=str)
    _user: Optional[str] = field(default=str)
