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
