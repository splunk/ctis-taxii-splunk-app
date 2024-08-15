from dataclasses import dataclass


@dataclass
class BaseModel:
    # https://dev.splunk.com/enterprise/docs/developapps/manageknowledge/kvstore/aboutkvstorecollections/
    # Reserved fields
    _key: str
    _user: str
