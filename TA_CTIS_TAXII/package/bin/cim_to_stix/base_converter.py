import abc

from stix2.patterns import _PatternExpression

from .ioc_category import IoCCategory


class CIMToSTIXConverter(abc.ABC):
    @staticmethod
    @abc.abstractmethod
    def convert(value: str) -> _PatternExpression:
        pass

    @staticmethod
    @abc.abstractmethod
    def category(value: str) -> IoCCategory:
        pass

    @staticmethod
    @abc.abstractmethod
    def supports_field(splunk_field_name: str, splunk_field_value: str) -> bool:
        pass
