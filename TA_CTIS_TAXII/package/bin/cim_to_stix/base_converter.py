import abc

from stix2.patterns import _PatternExpression
from .ioc_category import IoCCategory
from typing import Optional

class CIMToSTIXConverter(abc.ABC):
    @staticmethod
    @abc.abstractmethod
    def convert(value: str) -> _PatternExpression:
        pass

    @staticmethod
    @abc.abstractmethod
    def supports(ioc_category: IoCCategory) -> bool:
        pass

    @staticmethod
    @abc.abstractmethod
    def suggest_category(splunk_field_name:str, splunk_field_value:str) -> Optional[IoCCategory]:
        pass
